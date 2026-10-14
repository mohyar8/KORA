"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { BRAND } from "@/lib/constants";
import { ENTRANCE_ARCH as ARCH, PASSAGE, SCENERY_SPOTS } from "@/lib/exhibition/layout";
import { Batched } from "./Batched";
import { useAsyncTexture } from "./useAsyncTexture";
import { Plate } from "./kit/booth";
import { archFaceTexture, partnerGridTexture, patternSkinTexture } from "./kit/panels";
import { Instanced, Struts, glow, tubeAlong, useDispose, type Placement, type Segment, type V3 } from "./kit/primitives";

/**
 * Non-selectable event scenery from the preliminary renders. Positions are
 * inferred (F-15): the masterplan does not place these items.
 *  - Entrance arch «كورة — الصناعة خلف اللعبة» (…12.05.49 PM (3)) at the
 *    start of the main path.
 *  - Octagonal light tunnel + banners (…(4)) through the passage to the
 *    entertainment zone; photo booth (…(4)) at the passage mouth.
 *  - Coffee kiosk, press/interview wall and stanchions (…(2)) on the
 *    entrance forecourt, left of the main path. Partner marks are neutral placeholders (D-14).
 */

/* ---------------------------- Entrance arch ---------------------------- */

function EntranceArch() {
  const face = useAsyncTexture(() => archFaceTexture(BRAND.taglineAr));
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, ARCH.rOut, 0, Math.PI, false);
    s.lineTo(-ARCH.rIn, 0);
    s.absarc(0, 0, ARCH.rIn, Math.PI, 0, true);
    s.closePath();
    const body = new THREE.ExtrudeGeometry(s, { depth: ARCH.depth, bevelEnabled: false, curveSegments: 48 });
    body.translate(0, 0, -ARCH.depth / 2);
    const ring = new THREE.RingGeometry(ARCH.rIn, ARCH.rOut, 64, 1, 0, Math.PI);
    // Planar UVs over the full arch circle so the face graphic maps 1:1.
    const pos = ring.attributes.position;
    const uv = ring.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) / ARCH.rOut + 1) / 2, (pos.getY(i) / ARCH.rOut + 1) / 2);
    const pts = (r: number): V3[] =>
      Array.from({ length: 33 }, (_, i) => {
        const a = (i / 32) * Math.PI;
        return [Math.cos(a) * r, Math.sin(a) * r, 0];
      });
    const led = mergeGeometries(
      [
        tubeAlong(pts(ARCH.rIn + 0.04).map(([x, y]) => [x, y, ARCH.depth / 2 + 0.02] as V3), 0.03),
        tubeAlong(pts(ARCH.rIn + 0.04).map(([x, y]) => [x, y, -ARCH.depth / 2 - 0.02] as V3), 0.03),
      ].map((g) => g.toNonIndexed()),
    );
    return { body, ring, led };
  }, []);
  useDispose(geo.body, geo.ring, geo.led);
  return (
    // Arch plane spans Z (across the entrance); visitors walk through along +X.
    <group position={[ARCH.x, 0, ARCH.z]} rotation-y={Math.PI / 2}>
      <mesh geometry={geo.body} castShadow receiveShadow>
        <meshStandardMaterial color="#1f2c6e" roughness={0.55} />
      </mesh>
      {face &&
        [1, -1].map((s) => (
          <mesh key={s} geometry={geo.ring} position={[0, 0, s * (ARCH.depth / 2 + 0.005)]} rotation-y={s === 1 ? 0 : Math.PI}>
            <meshStandardMaterial map={face} emissive="#ffffff" emissiveMap={face} emissiveIntensity={0.35} roughness={0.55} />
          </mesh>
        ))}
      <mesh geometry={geo.led}>
        <meshBasicMaterial color={glow("#c9d6ff", 1.8)} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------- Passage light tunnel ------------------------ */

function octagonPoints(w: number, h: number, c: number): [number, number][] {
  return [
    [-w / 2, 0],
    [-w / 2, h - c],
    [-w / 2 + c, h],
    [w / 2 - c, h],
    [w / 2, h - c],
    [w / 2, 0],
  ];
}

/** Banner rows across the passage (relative to the buildings' facade line). */
const BANNER_ZS = [1, -4.5, -10].map((dz) => PASSAGE.frontZ + dz);

function PassageTunnel() {
  const frames = useMemo(() => {
    const zs = Array.from({ length: 7 }, (_, i) => PASSAGE.frontZ + 2.8 - i * 2.6);
    const panel: THREE.BufferGeometry[] = [];
    const led: THREE.BufferGeometry[] = [];
    const outline = octagonPoints(5.3, 5.6, 1.2);
    for (const z of zs) {
      // Navy frame band (outer outline extruded as thin boxes) + white/colour LED inner edge.
      for (let i = 0; i < outline.length - 1; i++) {
        const [x0, y0] = outline[i];
        const [x1, y1] = outline[i + 1];
        const len = Math.hypot(x1 - x0, y1 - y0);
        const g = new THREE.BoxGeometry(len + 0.3, 0.32, 0.25);
        g.rotateZ(Math.atan2(y1 - y0, x1 - x0));
        g.translate(PASSAGE.x + (x0 + x1) / 2, (y0 + y1) / 2, z);
        panel.push(g.toNonIndexed());
      }
      const inner = octagonPoints(4.95, 5.3, 1.05).map(([x, y]) => [PASSAGE.x + x, y + 0.02, z + 0.14] as V3);
      led.push(tubeAlong(inner, 0.025).toNonIndexed());
    }
    return { panel: mergeGeometries(panel), led: mergeGeometries(led) };
  }, []);
  const banner = useAsyncTexture(() => patternSkinTexture());
  useDispose(frames.panel, frames.led);
  const poles: Segment[] = useMemo(
    () =>
      BANNER_ZS.flatMap((z) => [
        [[PASSAGE.minX + 0.4, 0, z], [PASSAGE.minX + 0.4, 6.6, z]] as Segment,
        [[PASSAGE.maxX - 0.4, 0, z], [PASSAGE.maxX - 0.4, 6.6, z]] as Segment,
        [[PASSAGE.minX + 0.4, 6.5, z], [PASSAGE.maxX - 0.4, 6.5, z]] as Segment,
      ]),
    [],
  );
  return (
    <group>
      <mesh geometry={frames.panel} castShadow>
        <meshStandardMaterial color="#26357a" roughness={0.55} />
      </mesh>
      <mesh geometry={frames.led}>
        <meshBasicMaterial color={glow("#dfe6ff", 1.9)} toneMapped={false} />
      </mesh>
      <Struts segments={poles} radius={0.045}>
        <meshStandardMaterial color="#20232b" roughness={0.5} metalness={0.6} />
      </Struts>
      {banner &&
        BANNER_ZS.map((z) => (
          <mesh key={z} position={[PASSAGE.x, 5.9, z]}>
            <planeGeometry args={[4.6, 1.0]} />
            <meshStandardMaterial map={banner} side={THREE.DoubleSide} roughness={0.8} />
          </mesh>
        ))}
    </group>
  );
}

/* ------------------------------ Photo booth ---------------------------- */

function PhotoBooth({ position, rotationY }: { position: V3; rotationY: number }) {
  const skin = useAsyncTexture(() => patternSkinTexture("كورة"));
  const led = useMemo(() => {
    const pts: V3[] = [
      [-0.45, 0.15, 0.62],
      [-0.45, 1.95, 0.62],
      [0.45, 1.95, 0.62],
      [0.45, 0.15, 0.62],
    ];
    return tubeAlong(pts, 0.02);
  }, []);
  useDispose(led);
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[1.6, 2.3, 1.2]} />
        <meshStandardMaterial map={skin ?? undefined} color={skin ? "#ffffff" : "#26357a"} roughness={0.55} />
      </mesh>
      {/* Curtained opening. */}
      <mesh position={[0, 1.05, 0.605]}>
        <planeGeometry args={[0.86, 1.8]} />
        <meshStandardMaterial color="#1a2250" roughness={0.9} />
      </mesh>
      <mesh geometry={led}>
        <meshBasicMaterial color={glow("#b48cff", 1.8)} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------- Coffee kiosk + press wall ---------------------- */

function CoffeeKiosk({ position, rotationY }: { position: V3; rotationY: number }) {
  const skin = useAsyncTexture(() => patternSkinTexture());
  return (
    <group position={position} rotation-y={rotationY}>
      {/* Navy shell open to the front, white interior, counter. */}
      <mesh position={[0, 1.3, -1.0]} castShadow>
        <boxGeometry args={[2.6, 2.6, 0.12]} />
        <meshStandardMaterial color="#f1f2f5" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.24, 1.3, 0]} castShadow>
          <boxGeometry args={[0.12, 2.6, 2.1]} />
          <meshStandardMaterial map={skin ?? undefined} color={skin ? "#ffffff" : "#26357a"} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 2.72, 0]} castShadow>
        <boxGeometry args={[2.6, 0.4, 2.2]} />
        <meshStandardMaterial color="#26357a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0.75]} castShadow>
        <boxGeometry args={[2.36, 1.0, 0.5]} />
        <meshStandardMaterial color="#26357a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, 0.75]}>
        <boxGeometry args={[2.4, 0.04, 0.56]} />
        <meshStandardMaterial color="#f1f2f5" roughness={0.4} />
      </mesh>
      <Plate lines={[{ text: "ركن القهوة", size: 90 }, { text: "COFFEE", size: 46, dir: "ltr" }]} size={[1.4, 0.32]} position={[0, 2.72, 1.11]} bg="#26357a" />
      <pointLight position={[0, 2.2, 0.2]} color="#fff2df" intensity={6} distance={5} decay={2} />
    </group>
  );
}

function PressWall({ position, rotationY }: { position: V3; rotationY: number }) {
  const grid = useMemo(() => {
    const t = partnerGridTexture();
    t.repeat.set(2, 1);
    return t;
  }, []);
  useDispose(grid);
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.6, 0.18]} />
        <meshStandardMaterial color="#26357a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.3, 0.095]}>
        <planeGeometry args={[4.0, 2.4]} />
        <meshStandardMaterial map={grid} roughness={0.6} />
      </mesh>
      {/* Interview carpet + base light. */}
      <mesh position={[0, 0.015, 1.2]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[3.6, 2.0]} />
        <meshStandardMaterial color="#26357a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.04, 0.12]}>
        <boxGeometry args={[4.0, 0.02, 0.03]} />
        <meshBasicMaterial color={glow("#e8eeff", 1.6)} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Stanchions() {
  const { x0, z, count, spacing } = SCENERY_SPOTS.stanchions;
  const posts = useMemo<Placement[]>(() => Array.from({ length: count }, (_, i) => ({ p: [x0 + i * spacing, 0, z] as V3 })), [x0, z, count, spacing]);
  const geo = useMemo(
    () => ({
      post: new THREE.CylinderGeometry(0.03, 0.03, 0.95, 10).translate(0, 0.475, 0),
      base: new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16).translate(0, 0.015, 0),
      tape: new THREE.BoxGeometry(1.56, 0.12, 0.01).translate(0.8, 0.85, 0),
    }),
    [],
  );
  useDispose(geo.post, geo.base, geo.tape);
  return (
    <group>
      <Instanced geometry={geo.post} items={posts}>
        <meshStandardMaterial color="#c9ccd3" roughness={0.3} metalness={0.8} />
      </Instanced>
      <Instanced geometry={geo.base} items={posts}>
        <meshStandardMaterial color="#c9ccd3" roughness={0.3} metalness={0.8} />
      </Instanced>
      <Instanced geometry={geo.tape} items={posts.slice(0, -1)}>
        <meshStandardMaterial color="#26357a" roughness={0.6} />
      </Instanced>
    </group>
  );
}

export function Scenery() {
  return (
    <Batched delay={1500}>
      <EntranceArch />
      <PassageTunnel />
      <PhotoBooth position={[SCENERY_SPOTS.photoBooth.x, 0, SCENERY_SPOTS.photoBooth.z]} rotationY={SCENERY_SPOTS.photoBooth.rotationY} />
      <CoffeeKiosk position={[SCENERY_SPOTS.coffeeKiosk.x, 0, SCENERY_SPOTS.coffeeKiosk.z]} rotationY={SCENERY_SPOTS.coffeeKiosk.rotationY} />
      <PressWall position={[SCENERY_SPOTS.pressWall.x, 0, SCENERY_SPOTS.pressWall.z]} rotationY={SCENERY_SPOTS.pressWall.rotationY} />
      <Stanchions />
    </Batched>
  );
}
