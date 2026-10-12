import * as THREE from "three";
import { AREAS, OVERVIEW } from "@/lib/exhibition/areas";
import type { AreaId, CameraAnchor } from "@/lib/exhibition/types";
import { OBSTACLES } from "./obstacles";

export type Pose = { position: THREE.Vector3; target: THREE.Vector3 };

/** Vertical field of view per aspect: a little wider on portrait screens. */
export function fovFor(aspect: number) {
  return aspect < 0.8 ? 58 : aspect < 1.2 ? 50 : 40;
}

/** Distance at which `width` metres fill the horizontal field of view. */
function fitDistance(width: number, aspect: number, fovDeg: number) {
  const v = THREE.MathUtils.degToRad(fovDeg);
  const h = 2 * Math.atan(Math.tan(v / 2) * aspect);
  return (width / 2) / Math.tan(h / 2);
}

export function anchorPose(a: CameraAnchor, aspect: number): Pose {
  const fit = fitDistance(a.fitWidth, aspect, fovFor(aspect));
  const dist = Math.min(Math.max(a.distance, fit), a.maxDistance);
  const target = new THREE.Vector3(...a.target);
  const dir = new THREE.Vector3(
    Math.cos(a.elevation) * Math.cos(a.azimuth),
    Math.sin(a.elevation),
    Math.cos(a.elevation) * Math.sin(a.azimuth),
  );
  const position = target.clone().addScaledVector(dir, dist);
  // Portrait: the card occupies the lower half, so tilt the view down a
  // little to lift the subject into the upper part of the frame.
  if (aspect < 0.8) target.y -= 3;
  return { position, target };
}

export function overviewPose(aspect: number): Pose {
  const target = new THREE.Vector3(...OVERVIEW.target);
  const position = new THREE.Vector3(...OVERVIEW.position);
  const offset = position.clone().sub(target);
  const fit = fitDistance(OVERVIEW.fitWidth, aspect, fovFor(aspect));
  if (offset.length() < fit) offset.setLength(fit);
  return { position: target.clone().add(offset), target };
}

export function poseFor(id: AreaId | null, aspect: number): Pose {
  return id ? anchorPose(AREAS[id].anchor, aspect) : overviewPose(aspect);
}

const tmp = new THREE.Vector3();
const probe = new THREE.Vector3();

/** Quadratic Bézier position with a midpoint lifted by `lift` metres. */
export function flightPoint(from: THREE.Vector3, to: THREE.Vector3, lift: number, t: number, out: THREE.Vector3) {
  const mid = tmp.copy(from).lerp(to, 0.5);
  mid.y = Math.max(from.y, to.y) + lift;
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return out.set(
    a * from.x + b * mid.x + c * to.x,
    a * from.y + b * mid.y + c * to.y,
    a * from.z + b * mid.z + c * to.z,
  );
}

/**
 * Smallest arc height (from a gentle default upwards) for which the flight
 * path stays clear of every obstacle volume — so the camera never cuts
 * through the stage, the buildings or a booth.
 */
export function planLift(from: THREE.Vector3, to: THREE.Vector3) {
  let lift = THREE.MathUtils.clamp(from.distanceTo(to) * 0.22, 1.5, 14);
  for (let attempt = 0; attempt < 12; attempt++) {
    let clear = true;
    // Dense sampling: low anchors (museum, booths) sit close to obstacle
    // corners, where a coarse probe can step over a clip.
    for (let i = 1; i < 240 && clear; i++) {
      flightPoint(from, to, lift, i / 240, probe);
      for (const o of OBSTACLES) {
        if (o.containsPoint(probe)) {
          clear = false;
          break;
        }
      }
    }
    // A little headroom so the arc doesn't graze an obstacle between samples.
    if (clear) return lift * 1.1;
    lift *= 1.35;
  }
  return lift;
}

export function flightDuration(from: THREE.Vector3, to: THREE.Vector3) {
  return THREE.MathUtils.clamp(1.3 + from.distanceTo(to) / 32, 1.6, 3);
}
