import * as THREE from "three";
import { ENTRANCE_ARCH, PASSAGE } from "@/lib/exhibition/layout";
import type { AreaId } from "@/lib/exhibition/types";
import { OBSTACLES } from "./obstacles";
import { flightPoint, planLift, type Pose } from "./rig";

/**
 * Cinematic route to the entertainment zone (owner request, 2026-10-12):
 * instead of hopping over the buildings, the camera comes down over the
 * branch path that leaves the main path beyond the museum, passes over the
 * passage sign beside the photo booth, flies through the light tunnel under
 * the banners, then rises out of the passage to the zone's viewpoint. The
 * passage is never a stop and never selectable.
 *
 * Waypoints are placed relative to the passage (its x and the buildings'
 * facade line `frontZ`); the first leg adapts to where the flight starts
 * (lifted clear of obstacles). If no clear route exists for a start pose,
 * callers fall back to the ordinary arc. Reduced motion never gets here
 * (instant cut).
 */

// Corridor (see obstacles.ts): passage x ±1.5 m inside the tunnel, below
// 4.4 m; the passage sign at the mouth is cleared above 3.1 m.
const F = PASSAGE.frontZ;
const MOUTH = new THREE.Vector3(PASSAGE.x, 3.6, F + 5.4);
const INSIDE = new THREE.Vector3(PASSAGE.x, 3.2, F - 4);
const EXIT = new THREE.Vector3(PASSAGE.x, 3.4, F - 16);
const RISE = new THREE.Vector3(PASSAGE.x, 9, F - 20.5);
/** Over the branch path from the main path to the passage. */
const APPROACH = new THREE.Vector3(PASSAGE.x, 7, F + 22);
const LEAD = new THREE.Vector3(PASSAGE.x, 4.2, F + 11);
/** Starts north of this line (already beyond the buildings) fly the ordinary arc. */
const PLAZA_EDGE_Z = F + 4.3;
/** Relative speed inside the passage (slower, so the tunnel and banners read). */
const PASSAGE_SPEED = 0.5;

/**
 * Entering through the main gate (owner request, 2026-10-13): flights that
 * leave the overview come down behind the entrance arch, pass through its
 * opening at eye height, and only then turn to their destination.
 * Corridor (see obstacles.ts): |z| < 1.7 m, below 2.6 m.
 */
const A = ENTRANCE_ARCH;
const BEHIND = new THREE.Vector3(A.x - 14, 2.4, A.z);
const THROUGH = new THREE.Vector3(A.x, 1.7, A.z);
const AFTER = new THREE.Vector3(A.x + 10, 2.4, A.z);
/** Relative speed around the gate (slower, so the arch reads). */
const GATE_SPEED = 0.6;
const SAMPLES = 360;

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export type Route = {
  duration: number;
  /** Camera position and look target at eased progress t ∈ [0, 1]; `to` is the destination pose now (resize-safe). */
  sample: (t: number, to: Pose, pos: THREE.Vector3, target: THREE.Vector3) => void;
};

/** Collision probe spacing ≈ 0.1 m on a typical route. */
const PROBES = 1200;

function clear(curve: THREE.CatmullRomCurve3) {
  const p = new THREE.Vector3();
  for (let i = 1; i < PROBES; i++) {
    curve.getPointAt(i / PROBES, p);
    if (OBSTACLES.some((o) => o.containsPoint(p))) return false;
  }
  return true;
}

/** Inside the tunnel corridor, where an ordinary rising arc would cut through the roof. */
export function inPassage(p: THREE.Vector3) {
  return p.x > PASSAGE.minX && p.x < PASSAGE.maxX && p.z < F + 7.5 && p.z > F - 17 && p.y < 6;
}

/** Around the arch, low: slowed down, and an ordinary rising arc would cut through its top. */
export function inGate(p: THREE.Vector3) {
  return Math.abs(p.x - A.x) < 12 && Math.abs(p.z - A.z) < 5 && p.y < 4;
}

/**
 * Spline through `points(crest, k)` (the first leg's crest raised by `lift`
 * until the whole curve is clear), timed by arc length — slower inside the
 * passage — with a gaze that looks ahead along the path and settles on the
 * destination's target over [settleFrom, settleTo] (fractions of the path,
 * resolved from the sampled curve).
 */
function makeRoute(
  from: Pose,
  to: Pose,
  firstLeg: THREE.Vector3,
  /** `k` scales any further lifted legs together with the first one. */
  points: (crest: THREE.Vector3, k: number) => THREE.Vector3[],
  settle: (u: number, p: THREE.Vector3) => boolean,
  settleSpan: number,
  maxDuration: number,
): Route | null {
  const lift0 = planLift(from.position, firstLeg);
  let lift = lift0;
  let curve: THREE.CatmullRomCurve3 | null = null;
  for (let attempt = 0; attempt < 6 && !curve; attempt++) {
    const crest = flightPoint(from.position, firstLeg, lift, 0.5, new THREE.Vector3());
    const c = new THREE.CatmullRomCurve3(points(crest, lift / lift0), false, "centripetal");
    c.arcLengthDivisions = 400;
    if (clear(c)) curve = c;
    else lift *= 1.35;
  }
  if (!curve) return null;
  const path = curve;

  // Time-warp: cumulative "time" per arc length, slower inside the passage.
  const time = new Float32Array(SAMPLES + 1);
  const p = new THREE.Vector3();
  const q = new THREE.Vector3();
  path.getPointAt(0, q);
  let settleTo = 1;
  for (let i = 1; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    path.getPointAt(u, p);
    if (settleTo === 1 && settle(u, p)) settleTo = u;
    time[i] = time[i - 1] + p.distanceTo(q) / (inPassage(p) ? PASSAGE_SPEED : inGate(p) ? GATE_SPEED : 1);
    q.copy(p);
  }
  const settleFrom = Math.max(0.15, settleTo - settleSpan);
  const total = time[SAMPLES];
  const length = path.getLength();
  const plannedTo = to.position.clone();
  const fromTarget = from.target.clone();

  const uAt = (t: number) => {
    const goal = t * total;
    let lo = 0;
    let hi = SAMPLES;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (time[mid] < goal) lo = mid;
      else hi = mid;
    }
    const span = time[hi] - time[lo] || 1;
    return (lo + (goal - time[lo]) / span) / SAMPLES;
  };

  const ahead = new THREE.Vector3();
  const drift = new THREE.Vector3();
  return {
    duration: THREE.MathUtils.clamp(1.2 + total / 26, 2.2, maxDuration),
    sample(t, toNow, pos, target) {
      const u = uAt(THREE.MathUtils.clamp(t, 0, 1));
      path.getPointAt(u, pos);
      // Follow a resize of the destination pose during the last stretch.
      drift.subVectors(toNow.position, plannedTo).multiplyScalar(smooth(0.8, 1, u));
      pos.add(drift);
      // Gaze: from the start view, along the path (looking ahead) — never
      // steeper than ≈31° down, tilted slightly up in the tunnel so the
      // banners read — then settles on the destination.
      // Look far enough ahead to be ≥ 10 m away horizontally, so a steep
      // descent (e.g. from the overview down to the gate) faces where it is
      // going instead of straight down (which would also roll the view).
      let reach = 9;
      path.getPointAt(Math.min(1, u + reach / length), ahead);
      while (Math.hypot(ahead.x - pos.x, ahead.z - pos.z) < 10 && u + reach / length < 1) {
        reach += 6;
        path.getPointAt(Math.min(1, u + reach / length), ahead);
      }
      const across = Math.hypot(ahead.x - pos.x, ahead.z - pos.z);
      ahead.y = THREE.MathUtils.clamp(ahead.y + 0.9, pos.y - Math.max(4, across * 0.6), pos.y + 1.2);
      // The look-ahead takes over gradually, so a high start keeps looking
      // down at the venue instead of at the horizon.
      target.copy(fromTarget).lerp(ahead, smooth(0.05, 0.4, u));
      target.lerp(toNow.target, smooth(settleFrom, settleTo, u));
    },
  };
}

export function planPassageRoute(from: Pose, to: Pose): Route | null {
  if (from.position.z < PLAZA_EDGE_Z) return null;
  return makeRoute(
    from,
    to,
    APPROACH,
    (crest) => [from.position.clone(), crest, APPROACH, LEAD, MOUTH, INSIDE, EXIT, RISE, to.position.clone()],
    // Gaze is on the zone before the camera rises and backs into its viewpoint.
    (_, p) => p.z < RISE.z + 0.5,
    0.25,
    5.8,
  );
}

/**
 * A new destination chosen while the camera is inside the tunnel: carry on
 * to the end it is facing, climb out of the passage, then arc to the
 * destination — never up through the tunnel roof.
 */
export function planTunnelExit(from: Pose, to: Pose): Route | null {
  if (!inPassage(from.position)) return null;
  const north = from.target.z < from.position.z;
  const end = north ? EXIT.clone() : MOUTH.clone();
  const out = north ? new THREE.Vector3(PASSAGE.x, 7, F - 20) : new THREE.Vector3(PASSAGE.x, 6, F + 9.6);
  return makeRoute(
    { position: out, target: from.target },
    to,
    to.position,
    (crest) => [from.position.clone(), end, out, crest, to.position.clone()],
    (u) => u > 0.97,
    0.5,
    4.5,
  );
}

/**
 * From the overview into the venue through the main gate, then to the
 * destination (a lifted arc), or on through the passage for the
 * entertainment zone. Only when the flight starts outside, west of the arch.
 */
export function planEntranceRoute(from: Pose, to: Pose, viaPassage: boolean): Route | null {
  if (from.position.x > A.x - 5) return null;
  const lift2 = viaPassage ? 0 : planLift(AFTER, to.position);
  return makeRoute(
    from,
    to,
    BEHIND,
    (crest, k) => [
      from.position.clone(),
      crest,
      BEHIND,
      THROUGH,
      AFTER,
      ...(viaPassage
        ? [APPROACH, LEAD, MOUTH, INSIDE, EXIT, RISE]
        : [flightPoint(AFTER, to.position, lift2 * k, 0.5, new THREE.Vector3())]),
      to.position.clone(),
    ],
    viaPassage ? (_, p) => p.z < RISE.z + 0.5 : (u) => u > 0.97,
    viaPassage ? 0.25 : 0.35,
    viaPassage ? 7.5 : 6.5,
  );
}

/**
 * A new destination chosen while the camera is passing under the arch:
 * carry on through the gate the way it is heading, then arc away.
 */
export function planGateExit(from: Pose, to: Pose): Route | null {
  if (!inGate(from.position)) return null;
  const east = from.target.x > from.position.x;
  const out = east ? new THREE.Vector3(A.x + 12, 4, A.z) : new THREE.Vector3(A.x - 12, 4, A.z);
  return makeRoute(
    { position: out, target: from.target },
    to,
    to.position,
    (crest) => [from.position.clone(), east ? AFTER : BEHIND, out, crest, to.position.clone()],
    (u) => u > 0.97,
    0.5,
    5,
  );
}

/**
 * The one place that decides how the camera travels (used by CameraRig and
 * the dev collision sweep): through the gate when leaving the overview,
 * through the passage to the entertainment zone, out of the tunnel or the
 * gate when interrupted there — otherwise null (ordinary arc).
 */
export function planRoute(fromDest: AreaId | null, from: Pose, to: Pose, dest: AreaId | null): Route | null {
  if (dest !== null && fromDest === null) {
    const r = planEntranceRoute(from, to, dest === "entertainment");
    if (r) return r;
  }
  return (
    (dest === "entertainment" ? planPassageRoute(from, to) : null) ?? planTunnelExit(from, to) ?? planGateExit(from, to)
  );
}
