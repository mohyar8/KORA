"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useQuality } from "../quality";
import { broadcastTexture, glowTitleTexture } from "../textures";
import { useAsyncTexture } from "../useAsyncTexture";
import { MEDIA_PINK, Plate, Screen, TripodCamera, beamLoop, chamferShape, octagon, onWall, wallBetween } from "../kit/booth";
import { Detail, Instanced, glow, tubeAlong, useDispose, type Placement, type V3 } from "../kit/primitives";

/**
 * Media corner "ركن الإعلام — من الملعب إلى العالم", after the preliminary
 * render (references/…12.05.48 PM (1).jpeg): faceted plum walls, a raised
 * chamfered broadcast portal with twin screens over a control desk, a TV and
 * broadcast camera on the left facet, listening stations on the right facet,
 * an elongated-octagon canopy with pink LED edge and spotlights, the
 * section signs 01 / 02 / 03 and the glowing title.
 *
 * Adapted to the masterplan slot (3 × 3 m) — the render reads several times
 * larger (F-3). Left out on purpose: partner/third-party logos (D-14), the
 * render's garbled lettering ("KOXA X", "TANK", the 01 caption), real match
 * footage (replaced by our own pitch graphics).
 */

const D = 3;
const WALL_H = 2.5;
const BACK = -D / 2 + 0.05;
const PLUM = "#4a3c50";
const FRAME = "#2c2431";

// Plan of the faceted back wall, listed left → right as seen from the front.
const L_FRONT: [number, number] = [-1.45, 0.3];
const L_BACK: [number, number] = [-0.72, BACK];
const R_BACK: [number, number] = [0.72, BACK];
const R_FRONT: [number, number] = [1.45, 0.3];

function consoleTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 200;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#17141a";
  ctx.fillRect(0, 0, 512, 200);
  const cols = ["#3fd18a", "#f2c14e", "#e45a7a", "#5aa7ff", "#d9d9e0"];
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 30; x++) {
      if ((x * 7 + y * 3) % 5 === 0) continue;
      ctx.fillStyle = cols[(x + y * 2) % cols.length];
      ctx.globalAlpha = 0.55 + ((x * 13 + y) % 4) * 0.1;
      ctx.fillRect(14 + x * 16, 96 + y * 18, 9, 7);
    }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#27384f";
    ctx.fillRect(30 + i * 160, 18, 130, 62);
    ctx.fillStyle = "rgba(120,180,255,0.35)";
    ctx.fillRect(36 + i * 160, 24, 118, 50);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function playerCardTexture() {
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 220;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 320, 220);
  g.addColorStop(0, "#3b1f4f");
  g.addColorStop(1, "#22163a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 320, 220);
  ctx.fillStyle = "#2f8a45";
  ctx.fillRect(110, 24, 90, 150);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 7; i++) ctx.fillRect(220, 34 + i * 20, 70 - (i % 3) * 12, 8);
  ctx.fillStyle = "rgba(242,101,87,0.9)";
  ctx.fillRect(20, 40, 70, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function MediaCorner() {
  const q = useQuality();
  const title = useAsyncTexture(() => glowTitleTexture("ركن الإعلام", "#ff9ad6"));

  const built = useMemo(() => {
    const walls = mergeGeometries(
      [
        wallBetween(L_FRONT, L_BACK, WALL_H),
        wallBetween(L_BACK, R_BACK, WALL_H),
        wallBetween(R_BACK, R_FRONT, WALL_H),
      ].map((g) => g.toNonIndexed()),
    );
    const floor = new THREE.CylinderGeometry(1.48, 1.52, 0.08, 48, 1).translate(0, 0.04, -0.05);
    const ring = new THREE.TorusGeometry(1.05, 0.012, 6, 64).rotateX(Math.PI / 2).translate(0, 0.085, 0.05);
    const rim = new THREE.TorusGeometry(1.5, 0.014, 6, 64, Math.PI).rotateX(Math.PI / 2).translate(0, 0.02, -0.05);
    // Broadcast portal: chamfered slab proud of the back wall.
    const portalShape = chamferShape(1.42, 2.9, 0.32);
    const portal = new THREE.ExtrudeGeometry(portalShape, { depth: 0.16, bevelEnabled: false }).translate(0, 0, BACK + 0.04);
    const portalEdge = tubeAlong(
      [
        [-0.66, 0.15, BACK + 0.21],
        [-0.66, 2.9 - 0.32 - 0.04, BACK + 0.21],
        [-0.66 + 0.3, 2.86, BACK + 0.21],
        [0.66 - 0.3, 2.86, BACK + 0.21],
        [0.66, 2.9 - 0.32 - 0.04, BACK + 0.21],
        [0.66, 0.15, BACK + 0.21],
      ],
      0.01,
    );
    // Canopy: elongated octagon frame with struts down to the wall heads.
    const outline = octagon(3.5, 2.7, 0.55, -0.35);
    const canopy = beamLoop(outline, 3.0);
    const struts = mergeGeometries(
      [L_FRONT, L_BACK, R_BACK, R_FRONT].map(([x, z]) =>
        new THREE.BoxGeometry(0.08, 3.0 - WALL_H, 0.08).translate(x, (3.0 + WALL_H) / 2, z),
      ),
    );
    const canopyLed = tubeAlong(
      [...outline, outline[0]].map(([x, z]) => [x, 2.9, z] as V3),
      0.012,
    );
    // Control desk: base + raked top.
    const deskBase = new THREE.BoxGeometry(1.2, 0.78, 0.42).translate(0, 0.39 + 0.08, -0.68);
    const deskTop = new THREE.BoxGeometry(1.28, 0.05, 0.52).rotateX(0.32).translate(0, 0.92, -0.72);
    const desk = mergeGeometries([deskBase.toNonIndexed(), deskTop.toNonIndexed()]);
    const deskPanel = new THREE.PlaneGeometry(1.18, 0.44).rotateX(-Math.PI / 2 + 0.32).translate(0, 0.95, -0.71);
    const station = new THREE.BoxGeometry(0.24, 0.22, 0.07);
    const phones = new THREE.TorusGeometry(0.07, 0.016, 6, 16, Math.PI);
    const spot = new THREE.CylinderGeometry(0.045, 0.06, 0.16, 8);
    return {
      walls,
      floor,
      ring,
      rim,
      portal,
      portalEdge,
      canopy,
      struts,
      canopyLed,
      desk,
      deskPanel,
      station,
      phones,
      spot,
      console: consoleTexture(),
      card: playerCardTexture(),
      bcSplit: broadcastTexture(3, true),
      bcWide: broadcastTexture(5),
      bcTv: broadcastTexture(9),
    };
  }, []);
  useDispose(...Object.values(built));

  // Listening stations: 2 rows × 3 on the right facet (render: "do you know this voice?").
  const stations = useMemo(() => {
    const items: Placement[] = [];
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 3; i++) {
        const w = onWall(R_BACK, R_FRONT, 0.34 + i * 0.22, 1.05 + row * 0.36, 0.05);
        items.push({ p: w.position, r: w.rotationY });
      }
    return items;
  }, []);
  const phoneItems = useMemo(
    () => stations.map((s) => ({ p: [s.p[0], s.p[1] + 0.02, s.p[2]] as V3, r: s.r })),
    [stations],
  );
  const spots = useMemo<Placement[]>(
    () =>
      (
        [
          [-1.2, -0.9],
          [-0.55, -1.55],
          [0.55, -1.55],
          [1.2, -0.9],
          [-1.35, 0.4],
          [1.35, 0.4],
        ] as [number, number][]
      ).map(([x, z]) => ({ p: [x, 2.84, z] as V3, rx: 0.5, r: Math.atan2(-x, -z) })),
    [],
  );

  const tv = onWall(L_FRONT, L_BACK, 0.5, 1.55);
  const card = onWall(R_BACK, R_FRONT, 0.72, 1.75);

  return (
    <group>
      {/* Floor disc with LED ring and rim. */}
      <mesh geometry={built.floor} receiveShadow>
        <meshStandardMaterial color="#231c26" roughness={0.6} />
      </mesh>
      <mesh geometry={built.ring}>
        <meshBasicMaterial color={glow("#ff8fd0", 1.6)} toneMapped={false} />
      </mesh>
      <mesh geometry={built.rim}>
        <meshBasicMaterial color={MEDIA_PINK} toneMapped={false} />
      </mesh>

      {/* Faceted walls, portal and canopy. */}
      <mesh geometry={built.walls} castShadow receiveShadow>
        <meshStandardMaterial color={PLUM} roughness={0.72} />
      </mesh>
      <mesh geometry={built.portal} castShadow>
        <meshStandardMaterial color={FRAME} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh geometry={built.portalEdge}>
        <meshBasicMaterial color={MEDIA_PINK} toneMapped={false} />
      </mesh>
      <mesh geometry={built.canopy} castShadow>
        <meshStandardMaterial color={FRAME} roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh geometry={built.struts}>
        <meshStandardMaterial color={FRAME} roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh geometry={built.canopyLed}>
        <meshBasicMaterial color={MEDIA_PINK} toneMapped={false} />
      </mesh>
      <Instanced geometry={built.spot} items={spots}>
        <meshStandardMaterial color="#1a161c" roughness={0.5} metalness={0.5} />
      </Instanced>

      <Detail>
      {/* Portal screens over the control desk (section 02 "behind the broadcast"). */}
      <Screen texture={built.bcSplit} size={[0.6, 0.34]} position={[-0.33, 1.78, BACK + 0.22]} />
      <Screen texture={built.bcWide} size={[0.6, 0.34]} position={[0.33, 1.78, BACK + 0.22]} />
      <mesh geometry={built.desk} castShadow>
        <meshStandardMaterial color={FRAME} roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh geometry={built.deskPanel}>
        <meshBasicMaterial map={built.console} toneMapped={false} />
      </mesh>

      {/* Left facet: TV + broadcast camera (section 01). */}
      <Screen texture={built.bcTv} size={[0.82, 0.46]} position={tv.position} rotationY={tv.rotationY} />
      <TripodCamera position={[-0.82, 0.08, -0.15]} rotationY={0.9} />

      {/* Right facet: player card + listening stations (section 03). */}
      <Screen texture={built.card} size={[0.46, 0.32]} position={card.position} rotationY={card.rotationY} brightness={0.95} />
      <Instanced geometry={built.station} items={stations}>
        <meshStandardMaterial color="#201b24" roughness={0.6} />
      </Instanced>
      <Instanced geometry={built.phones} items={phoneItems}>
        <meshStandardMaterial color="#0c0b0e" roughness={0.4} metalness={0.4} />
      </Instanced>

      {/* Signage. */}
      <Plate
        lines={[{ text: "من الملعب إلى العالم", size: 92 }]}
        size={[1.5, 0.3]}
        position={[0, 2.62, 0.62]}
        bg="#2b2230"
      />
      <Plate lines={[{ text: "خلف البث", size: 84 }]} number="02" size={[0.9, 0.2]} position={[0, 2.62, BACK + 0.3]} />
      {(() => {
        const s1 = onWall(L_FRONT, L_BACK, 0.4, 2.62, 0.25);
        const s3 = onWall(R_BACK, R_FRONT, 0.6, 2.62, 0.25);
        return (
          <>
            <Plate lines={[{ text: " ", size: 60 }]} number="01" size={[0.8, 0.2]} position={s1.position} rotationY={s1.rotationY} />
            <Plate
              lines={[{ text: "من البث إلى العالم", size: 74 }]}
              number="03"
              size={[0.9, 0.2]}
              position={s3.position}
              rotationY={s3.rotationY}
            />
          </>
        );
      })()}
      {(() => {
        const qs = onWall(R_BACK, R_FRONT, 0.38, 2.08, 0.05);
        return (
          <Plate
            lines={[{ text: "هل تعرف هذا الصوت؟", size: 64 }]}
            size={[0.62, 0.13]}
            position={qs.position}
            rotationY={qs.rotationY}
            bg="#3a2f3f"
          />
        );
      })()}
      </Detail>
      {title && (
        <mesh position={[0, 3.42, 0.62]}>
          <planeGeometry args={[1.9, 0.48]} />
          <meshBasicMaterial map={title} transparent toneMapped={false} color={new THREE.Color(1.6, 1.4, 1.55)} depthWrite={false} />
        </mesh>
      )}

      {q.lights && <pointLight position={[0, 2.2, 0.6]} color="#ffd2ec" intensity={12} distance={6} decay={2} />}
    </group>
  );
}
