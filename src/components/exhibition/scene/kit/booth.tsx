"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { plateTexture } from "../textures";
import { useAsyncTexture } from "../useAsyncTexture";
import { glow, useDispose, type V3 } from "./primitives";

/**
 * Parametric booth kit. Booth frame: origin at the footprint centre on the
 * ground, width along X, open front towards +Z, back wall at z = −depth/2.
 * Pieces are generic (walls, facets, chamfered portal, canopy outline, plates,
 * screens, AV props); each corner composes them after its own design.
 */

/** A vertical wall slab between two floor points (plan coordinates x,z). */
export function wallBetween(a: [number, number], b: [number, number], height: number, thickness = 0.08, y0 = 0) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  const g = new THREE.BoxGeometry(len, height, thickness);
  g.rotateY(-Math.atan2(dz, dx));
  g.translate((a[0] + b[0]) / 2, y0 + height / 2, (a[1] + b[1]) / 2);
  return g;
}

/** Placement on a wall face: position just in front of the a→b wall at (t along, y), facing the interior (+normal). */
export function onWall(a: [number, number], b: [number, number], t: number, y: number, offset = 0.05) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  // Interior normal: left of a→b when walls are listed left→right seen from the front.
  const nx = -dz / len;
  const nz = dx / len;
  return {
    position: [a[0] + dx * t + nx * offset, y, a[1] + dz * t + nz * offset] as V3,
    rotationY: Math.atan2(nx, nz),
  };
}

/** Rectangle with chamfered top corners (portal / octagonal frames), as a flat shape in XY. */
export function chamferShape(w: number, h: number, c: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, h - c);
  s.lineTo(w / 2 - c, h);
  s.lineTo(-w / 2 + c, h);
  s.lineTo(-w / 2, h - c);
  s.closePath();
  return s;
}

/** Closed polygon outline as beams (boxes) — e.g. an elongated octagon canopy frame in plan. */
export function beamLoop(points: [number, number][], y: number, w = 0.14, h = 0.18) {
  const parts = points.map((p, i) => {
    const q = points[(i + 1) % points.length];
    const g = new THREE.BoxGeometry(Math.hypot(q[0] - p[0], q[1] - p[1]) + w, h, w);
    g.rotateY(-Math.atan2(q[1] - p[1], q[0] - p[0]));
    g.translate((p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2);
    return g;
  });
  return mergeGeometries(parts);
}

/** Elongated octagon in plan (canopy outline). */
export function octagon(w: number, d: number, c: number, cz = 0): [number, number][] {
  const x = w / 2;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  return [
    [-x + c, z0],
    [x - c, z0],
    [x, z0 + c],
    [x, z1 - c],
    [x - c, z1],
    [-x + c, z1],
    [-x, z1 - c],
    [-x, z0 + c],
  ];
}

/** Dark plate with caption (header / hanging section signs). */
export function Plate({
  lines,
  size,
  position,
  rotationY = 0,
  number,
  bg,
  fg,
}: {
  lines: { text: string; size: number; dir?: CanvasDirection }[];
  size: [number, number];
  position: V3;
  rotationY?: number;
  number?: string;
  bg?: string;
  fg?: string;
}) {
  const key = JSON.stringify([lines, number, bg, fg, size]);
  const tex = useAsyncTexture(
    // Factory recreated per key; the hook only calls it on mount.
    useMemo(
      () => () =>
        plateTexture(lines, {
          width: 1024,
          height: Math.round((1024 * size[1]) / size[0]),
          number,
          bg,
          fg,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [key],
    ),
  );
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[size[0] + 0.03, size[1] + 0.03, 0.03]} />
        <meshStandardMaterial color="#1a151c" roughness={0.6} />
      </mesh>
      {tex && (
        <mesh>
          <planeGeometry args={size} />
          <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.45} roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}

/** A screen: dark bezel + emissive content. */
export function Screen({
  texture,
  size,
  position,
  rotationY = 0,
  brightness = 1.05,
}: {
  texture: THREE.Texture;
  size: [number, number];
  position: V3;
  rotationY?: number;
  brightness?: number;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, 0.04]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial map={texture} color={new THREE.Color(brightness, brightness, brightness)} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Broadcast camera on a tripod (approx. 1.6 m to lens). */
export function TripodCamera({ position, rotationY = 0 }: { position: V3; rotationY?: number }) {
  const geo = useMemo(() => {
    const legs = [0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.015, 0.015, 1.42, 6);
      g.translate(0, 0.71, 0);
      g.rotateZ(0.32);
      g.rotateY(a);
      return g.toNonIndexed();
    });
    const head = new THREE.BoxGeometry(0.12, 0.12, 0.12).translate(0, 1.38, 0).toNonIndexed();
    const body = new THREE.BoxGeometry(0.2, 0.22, 0.42).translate(0, 1.55, 0).toNonIndexed();
    const lens = new THREE.CylinderGeometry(0.07, 0.08, 0.22, 12).rotateX(Math.PI / 2).translate(0, 1.56, 0.3).toNonIndexed();
    const viewfinder = new THREE.BoxGeometry(0.12, 0.09, 0.12).translate(-0.12, 1.68, -0.1).toNonIndexed();
    const all = [...legs, head, body, lens, viewfinder];
    all.forEach((g) => g.deleteAttribute("uv"));
    return mergeGeometries(all);
  }, []);
  useDispose(geo);
  return (
    <mesh geometry={geo} position={position} rotation-y={rotationY} castShadow>
      <meshStandardMaterial color="#141418" roughness={0.45} metalness={0.5} />
    </mesh>
  );
}

/** Pink/lilac LED accent used on the Media family frames. */
export const MEDIA_PINK = glow("#ff8fd0", 2.2);
