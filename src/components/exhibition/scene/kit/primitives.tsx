"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";

/**
 * Small shared building blocks for code-authored event structures (stage,
 * booths). Everything that repeats is instanced so a whole structure stays
 * at a handful of draw calls.
 */

export type V3 = [number, number, number];
export type Segment = [V3, V3];

const UP = new THREE.Vector3(0, 1, 0);

/** Thin members between point pairs (truss chords/lacing, posts, rails) as one instanced draw. */
export function Struts({
  segments,
  radius,
  children,
  radial = 6,
}: {
  segments: Segment[];
  radius: number;
  children: ReactNode;
  radial?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.CylinderGeometry(radius, radius, 1, radial, 1, true), [radius, radial]);
  useEffect(() => () => geo.dispose(), [geo]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const dir = new THREE.Vector3();
    segments.forEach(([s, e], i) => {
      a.set(...s);
      b.set(...e);
      dir.subVectors(b, a);
      const len = dir.length();
      q.setFromUnitVectors(UP, dir.normalize());
      m.compose(a.clone().lerp(b, 0.5), q, new THREE.Vector3(1, len, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [segments]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, segments.length]} castShadow>
      {children}
    </instancedMesh>
  );
}

/**
 * Box-section truss between two points: four chords plus zig-zag lacing on
 * every face (typical 290–400 mm event truss).
 */
export function truss(from: V3, to: V3, size = 0.4, bay = 0.5): Segment[] {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const axis = new THREE.Vector3().subVectors(b, a);
  const len = axis.length();
  axis.normalize();
  const ref = Math.abs(axis.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : UP;
  const u = new THREE.Vector3().crossVectors(axis, ref).normalize().multiplyScalar(size / 2);
  const v = new THREE.Vector3().crossVectors(axis, u).normalize().multiplyScalar(size / 2);
  const corners = [u.clone().add(v), u.clone().sub(v), u.clone().negate().sub(v), u.clone().negate().add(v)];
  const out: Segment[] = [];
  const at = (t: number, c: THREE.Vector3) => a.clone().addScaledVector(axis, t).add(c).toArray() as V3;
  for (const c of corners) out.push([at(0, c), at(len, c)]);
  const bays = Math.max(1, Math.round(len / bay));
  for (let i = 0; i < bays; i++) {
    const t0 = (len * i) / bays;
    const t1 = (len * (i + 1)) / bays;
    for (let k = 0; k < 4; k++) {
      const c0 = corners[k];
      const c1 = corners[(k + 1) % 4];
      out.push(i % 2 ? [at(t0, c0), at(t1, c1)] : [at(t0, c1), at(t1, c0)]);
    }
  }
  return out;
}

export type Placement = { p: V3; s?: V3; r?: number; rx?: number };

/** Instanced copies of one geometry. */
export function Instanced({
  geometry,
  items,
  children,
  castShadow,
}: {
  geometry: THREE.BufferGeometry;
  items: Placement[];
  children: ReactNode;
  castShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    items.forEach((it, i) => {
      e.set(it.rx ?? 0, it.r ?? 0, 0, "YXZ");
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(...it.p), q, new THREE.Vector3(...(it.s ?? [1, 1, 1])));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, items.length]} castShadow={castShadow} receiveShadow>
      {children}
    </instancedMesh>
  );
}

/** HDR emissive colour for LED strips/lenses (values > 1 drive the bloom pass). */
export const glow = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

/** A tube following a polyline (LED strips along curves). */
export function tubeAlong(points: V3[], radius: number) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  return new THREE.TubeGeometry(curve, Math.max(8, points.length * 4), radius, 5, false);
}

/** Points on a horizontal arc (centre cx/cz, radius r, angles a0→a1 from +X towards +Z). */
export function arcPoints(cx: number, cz: number, r: number, a0: number, a1: number, y: number, n = 24): V3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3;
  });
}

/** Disposes a list of geometries on unmount. */
export function useDispose(...items: { dispose: () => void }[]) {
  useEffect(
    () => () => items.forEach((i) => i.dispose()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    items,
  );
}

/**
 * Distance LOD for fine interior detail (screens, plates, props): rendered
 * only while the camera is within `distance` metres of the group's origin.
 * Shells, titles and landmarks stay outside so the overview keeps its
 * silhouettes. Excluded from static batching so the toggle keeps working.
 *
 * Lights inside are never hidden: they fade to intensity 0 instead. In
 * three.js the number of active lights is part of every lit material's
 * shader, so hiding a light makes all of them recompile — the multi-second
 * stalls seen mid-flight before (perf pass, 2026-10-14). With a constant
 * light set, every shader is compiled once, behind the loading screen.
 */
export function Detail({ children, distance = 22 }: { children: ReactNode; distance?: number }) {
  const ref = useRef<THREE.Group>(null);
  const world = useMemo(() => new THREE.Vector3(), []);
  const st = useRef<{ near: boolean | null; count: number; base: WeakMap<THREE.Light, number> }>({
    near: null,
    count: -1,
    base: new WeakMap(),
  });
  useFrame(({ camera }) => {
    const g = ref.current;
    if (!g) return;
    g.getWorldPosition(world);
    const near = camera.position.distanceTo(world) < distance;
    // Children can mount late (async textures): re-apply when they change too.
    if (st.current.near === near && st.current.count === g.children.length) return;
    st.current.near = near;
    st.current.count = g.children.length;
    for (const child of g.children) {
      const light = child as THREE.Light;
      if (light.isLight) {
        if (!st.current.base.has(light)) st.current.base.set(light, light.intensity);
        light.intensity = near ? (st.current.base.get(light) ?? light.intensity) : 0;
      } else child.visible = near;
    }
  });
  return (
    <group ref={ref} userData={{ noBatch: true }}>
      {children}
    </group>
  );
}
