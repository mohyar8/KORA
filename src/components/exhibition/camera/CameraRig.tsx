"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { AreaId } from "@/lib/exhibition/types";
import { flightDuration, flightPoint, fovFor, poseFor, type Pose } from "./rig";

export type LookInput = { yaw: number; pitch: number };

type Props = {
  selected: AreaId | null;
  /** Desired look offsets (radians), written by the gesture/keyboard layer. */
  look: RefObject<LookInput>;
  reducedMotion: boolean;
  onArrive: (id: AreaId | null) => void;
};

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Camera state machine: overview ⇄ anchored, with interruptible cinematic
 * flights between poses and a damped, clamped look-around from a fixed
 * standpoint (never an orbit). Poses are recomputed from the viewport aspect
 * every frame, so resizing mid-flight or while anchored never jumps.
 */
export function CameraRig({ selected, look, reducedMotion, onArrive }: Props) {
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);

  const st = useRef({
    dest: selected,
    flying: false,
    from: null as Pose | null,
    progress: { t: 0 },
    tween: null as gsap.core.Tween | null,
    yaw: 0,
    pitch: 0,
  });
  const arrive = useRef(onArrive);
  useLayoutEffect(() => {
    arrive.current = onArrive;
  });

  useLayoutEffect(() => {
    const camera = get().camera as THREE.PerspectiveCamera;
    camera.fov = fovFor(aspect);
    camera.near = 0.3;
    camera.far = 2000;
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, aspect, invalidate]);

  useEffect(() => {
    const s = st.current;
    if (s.dest === selected) return;
    const camera = get().camera as THREE.PerspectiveCamera;
    const a = camera.aspect;
    // Start from exactly what is on screen now (including look offsets or a
    // half-finished flight), so interruptions never jump.
    const dir = camera.getWorldDirection(new THREE.Vector3());
    const reach = poseFor(s.dest, a);
    const from: Pose = {
      position: camera.position.clone(),
      target: camera.position.clone().addScaledVector(dir, reach.position.distanceTo(reach.target)),
    };
    s.tween?.kill();
    s.dest = selected;
    // The caller resets the look goals on selection; bake current offsets.
    s.yaw = s.pitch = 0;

    const to = poseFor(selected, a);
    if (reducedMotion) {
      s.flying = false;
      s.tween = null;
      invalidate();
      arrive.current(selected);
      return;
    }
    s.from = from;
    s.flying = true;
    s.progress.t = 0;
    s.tween = gsap.to(s.progress, {
      t: 1,
      duration: flightDuration(from.position, to.position),
      ease: "power2.inOut",
      onUpdate: () => invalidate(),
      onComplete: () => {
        s.flying = false;
        s.tween = null;
        invalidate();
        arrive.current(selected);
      },
    });
  }, [selected, get, invalidate, reducedMotion]);

  useEffect(() => {
    const s = st.current;
    return () => {
      s.tween?.kill();
    };
  }, []);

  const v = useMemo(
    () => ({ pos: new THREE.Vector3(), target: new THREE.Vector3(), dir: new THREE.Vector3(), right: new THREE.Vector3() }),
    [],
  );

  useFrame((state, dt) => {
    const { pos, target, dir, right } = v;
    const s = st.current;
    const a = state.size.width / Math.max(1, state.size.height);
    const to = poseFor(s.dest, a);
    if (s.flying && s.from) {
      const t = s.progress.t;
      flightPoint(s.from.position, to.position, t, pos);
      // The gaze leads the body slightly, like a camera operator.
      const tt = Math.min(1, t * 1.12);
      target.copy(s.from.target).lerp(to.target, tt * tt * (3 - 2 * tt));
    } else {
      pos.copy(to.position);
      target.copy(to.target);
    }

    const goal = look.current ?? { yaw: 0, pitch: 0 };
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 9);
    s.yaw += (goal.yaw - s.yaw) * k;
    s.pitch += (goal.pitch - s.pitch) * k;
    if (Math.abs(goal.yaw - s.yaw) > 1e-4 || Math.abs(goal.pitch - s.pitch) > 1e-4) invalidate();

    dir.subVectors(target, pos);
    const dist = dir.length();
    dir.normalize().applyAxisAngle(UP, s.yaw);
    right.crossVectors(dir, UP).normalize();
    dir.applyAxisAngle(right, s.pitch);
    state.camera.position.copy(pos);
    state.camera.lookAt(pos.x + dir.x * dist, pos.y + dir.y * dist, pos.z + dir.z * dist);
  });

  return null;
}
