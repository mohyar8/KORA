import * as THREE from "three";
import { PASSAGE } from "@/lib/exhibition/layout";
import { OBSTACLES } from "./obstacles";
import { flightPoint, planLift, type Pose } from "./rig";

/**
 * Cinematic route to the entertainment zone (owner request, 2026-10-12):
 * instead of hopping over Building 57, the camera drops behind the stage,
 * passes over the passage sign and the photo booth, flies through the light
 * tunnel under the banners, then rises out of the passage to the zone's
 * viewpoint. The passage is never a stop and never selectable.
 *
 * Waypoints are fixed in the passage; the approach adapts to where the
 * flight starts (west or east of the passage, lifted clear of obstacles).
 * If no clear route exists for a start pose, callers fall back to the
 * ordinary arc. Reduced motion never gets here (instant cut).
 */

// Corridor (see obstacles.ts): x 25.5–28.5 inside the tunnel, below 4.4 m;
// the passage sign at the mouth is cleared above 3.1 m.
const SIDE_OFFSET = 3.2;
const MOUTH = new THREE.Vector3(PASSAGE.x, 3.6, -1.6);
const INSIDE = new THREE.Vector3(PASSAGE.x, 3.2, -11);
const EXIT = new THREE.Vector3(PASSAGE.x, 3.4, -23);
const RISE = new THREE.Vector3(PASSAGE.x, 9, -27.5);
/** Approach points in the backstage strip between the stage and the buildings. */
const APPROACH = {
  west: new THREE.Vector3(14, 6.5, 1.2),
  east: new THREE.Vector3(40, 6.5, 1.2),
};
/** Starts north of this line (already beyond the buildings) fly the ordinary arc. */
const PLAZA_EDGE_Z = -2.7;
/** Relative speed inside the passage (slower, so the tunnel and banners read). */
const PASSAGE_SPEED = 0.5;
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
  return p.x > PASSAGE.minX && p.x < PASSAGE.maxX && p.z < 0.5 && p.z > -24 && p.y < 6;
}

/**
 * Spline through `points(lift)` (the first leg's crest raised by `lift`
 * until the whole curve is clear), timed by arc length — slower inside the
 * passage — with a gaze that looks ahead along the path and settles on the
 * destination's target over [settleFrom, settleTo] (fractions of the path,
 * resolved from the sampled curve).
 */
function makeRoute(
  from: Pose,
  to: Pose,
  firstLeg: THREE.Vector3,
  points: (crest: THREE.Vector3) => THREE.Vector3[],
  settle: (u: number, p: THREE.Vector3) => boolean,
  settleSpan: number,
  maxDuration: number,
): Route | null {
  let lift = planLift(from.position, firstLeg);
  let curve: THREE.CatmullRomCurve3 | null = null;
  for (let attempt = 0; attempt < 6 && !curve; attempt++) {
    const crest = flightPoint(from.position, firstLeg, lift, 0.5, new THREE.Vector3());
    const c = new THREE.CatmullRomCurve3(points(crest), false, "centripetal");
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
    time[i] = time[i - 1] + p.distanceTo(q) / (inPassage(p) ? PASSAGE_SPEED : 1);
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
      // steeper than ≈24° down, tilted slightly up in the tunnel so the
      // banners read — then settles on the destination.
      path.getPointAt(Math.min(1, u + 9 / length), ahead);
      ahead.y = THREE.MathUtils.clamp(ahead.y + 0.9, pos.y - 4, pos.y + 1.2);
      target.copy(fromTarget).lerp(ahead, smooth(0, 0.14, u));
      target.lerp(toNow.target, smooth(settleFrom, settleTo, u));
    },
  };
}

export function planPassageRoute(from: Pose, to: Pose): Route | null {
  if (from.position.z < PLAZA_EDGE_Z) return null;
  const west = from.position.x < PASSAGE.x;
  const approach = west ? APPROACH.west : APPROACH.east;
  const side = new THREE.Vector3(PASSAGE.x + (west ? -SIDE_OFFSET : SIDE_OFFSET), 3.8, 1.0);
  return makeRoute(
    from,
    to,
    approach,
    (crest) => [from.position.clone(), crest, approach, side, MOUTH, INSIDE, EXIT, RISE, to.position.clone()],
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
  const out = north ? new THREE.Vector3(PASSAGE.x, 7, -27) : new THREE.Vector3(PASSAGE.x, 6, 2.6);
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
