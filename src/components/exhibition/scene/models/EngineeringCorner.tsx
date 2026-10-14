"use client";

import { useMemo } from "react";
import { CORNER_SLOTS } from "@/lib/exhibition/layout";
import { useQuality } from "../quality";
import { canvas, finish } from "../textures";
import { useAsyncTexture } from "../useAsyncTexture";
import { Plate } from "../kit/booth";
import { dashboardTexture, fasciaTexture } from "../kit/panels";
import { Detail, Struts, glow, truss, useDispose, type Segment, type V3 } from "../kit/primitives";
import { Kiosk, Panel, StadiumModel } from "./NavyShellCorners";

/**
 * Engineering corner — PROVISIONAL CONCEPT (owner request, 2026-10-13). No
 * design was supplied, so this is not a preliminary design from the brief:
 * it borrows the corners' design language (navy shell, lit fascia with the
 * official lockup, white linear light, brand-colour accents) and adds an
 * engineering theme — a steel-truss portal in the proportions of a football
 * goal, a blueprint back wall (stadium section) and floor, X-braced open
 * side, and the stadium miniature cut away on a plinth. A plate at the front
 * marks it «تصور مبدئي». Authored at the slot's design size, enlarged by
 * the area frame like the other booths.
 */

const H = 2.6;
const NAVY = "#1b2350";
const STEEL = "#c9ccd3";
const SLOT = CORNER_SLOTS[5];

/** Blueprint drawing: a stadium cross-section with tiers, cantilever roof truss and dimension lines. */
function blueprintTexture() {
  const { c, ctx } = canvas(1024, 512);
  ctx.fillStyle = "#0f2856";
  ctx.fillRect(0, 0, 1024, 512);
  // Drawing grid.
  ctx.strokeStyle = "rgba(170,200,255,0.16)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(236,243,255,0.92)";
  ctx.lineWidth = 3;
  const ground = 410;
  // Pitch line and the stepped stand on both sides (section).
  ctx.beginPath();
  ctx.moveTo(300, ground);
  ctx.lineTo(724, ground);
  ctx.stroke();
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? 300 : 724;
    ctx.beginPath();
    ctx.moveTo(x0, ground);
    for (let i = 1; i <= 7; i++) {
      const x = x0 + s * i * 26;
      const y = ground - i * 22;
      ctx.lineTo(x - s * 26, y);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x0 + s * 182, ground);
    ctx.stroke();
    // Cantilever roof truss over the stand.
    const top = ground - 7 * 22 - 70;
    const back = x0 + s * 200;
    ctx.beginPath();
    ctx.moveTo(back, ground);
    ctx.lineTo(back, top);
    ctx.lineTo(x0 - s * 30, top + 24);
    ctx.lineTo(back, top + 46);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 8; i++) {
      const x = back - s * i * 29;
      const t = i / 8;
      ctx.beginPath();
      // Lacing between the top chord (falling 24 px to the tip) and the bottom chord.
      ctx.moveTo(x, top + 24 * t);
      ctx.lineTo(x - s * 14, top + 46 - 22 * t);
      ctx.stroke();
    }
    ctx.lineWidth = 3;
  }
  // Dimension line.
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(300, ground + 40);
  ctx.lineTo(724, ground + 40);
  ctx.moveTo(300, ground + 30);
  ctx.lineTo(300, ground + 50);
  ctx.moveTo(724, ground + 30);
  ctx.lineTo(724, ground + 50);
  ctx.stroke();
  ctx.fillStyle = "rgba(236,243,255,0.9)";
  ctx.font = "600 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("105.00", 512, ground + 34);
  ctx.textAlign = "left";
  ctx.font = "700 26px sans-serif";
  ctx.fillText("STADIUM SECTION  A–A", 40, 54);
  ctx.font = "500 18px sans-serif";
  ctx.fillStyle = "rgba(236,243,255,0.6)";
  ctx.fillText("CANTILEVER ROOF · TIERED STAND · PITCH", 40, 84);
  return finish(c);
}

/** Blueprint floor: pitch outline with a grid, in technical-drawing style. */
function floorTexture() {
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = "#11204a";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(170,200,255,0.2)";
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(236,243,255,0.8)";
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 8]);
  ctx.strokeRect(36, 36, 440, 440);
  ctx.beginPath();
  ctx.moveTo(256, 36);
  ctx.lineTo(256, 476);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(256, 256, 64, 0, Math.PI * 2);
  ctx.stroke();
  return finish(c);
}

export function EngineeringCorner() {
  const q = useQuality();
  const { w, d } = SLOT;
  const back = -d / 2;
  const front = d / 2;
  const tex = useMemo(() => ({ print: blueprintTexture(), floor: floorTexture(), screen: dashboardTexture(17) }), []);
  useDispose(tex.print, tex.floor, tex.screen);
  const fascia = useAsyncTexture(() => fasciaTexture("ركن الهندسة", "ENGINEERING CORNER"));

  // Goal-frame portal: two truss posts and a truss crossbar across the
  // opening, plus roof trusses running back to the rear wall.
  const top = H + 0.35;
  const steel = useMemo<Segment[]>(() => {
    const px = w / 2 - 0.2;
    const fz = front - 0.2;
    return [
      ...truss([-px, 0, fz], [-px, top, fz], 0.28, 0.45),
      ...truss([px, 0, fz], [px, top, fz], 0.28, 0.45),
      ...truss([-px - 0.14, top, fz], [px + 0.14, top, fz], 0.28, 0.45),
      ...truss([-px, top, fz], [-px, top, back + 0.2], 0.22, 0.5),
      ...truss([px, top, fz], [px, top, back + 0.2], 0.22, 0.5),
      // X-bracing on the open (right) side.
      [[px, 0.1, back + 0.2], [px, H - 0.1, fz - 0.3]],
      [[px, H - 0.1, back + 0.2], [px, 0.1, fz - 0.3]],
    ];
  }, [w, front, back, top]);
  const white = glow("#f4f7ff", 2.4);

  return (
    <group>
      {/* Floor plinth with the blueprint pitch. */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial map={tex.floor} roughness={0.55} />
      </mesh>
      {/* Rear wall + left wall (navy shell); the right side stays open, braced. */}
      <mesh position={[0, H / 2, back + 0.04]} castShadow receiveShadow>
        <boxGeometry args={[w, H, 0.08]} />
        <meshStandardMaterial color={NAVY} roughness={0.7} />
      </mesh>
      <mesh position={[-(w / 2 - 0.04), H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, H, d]} />
        <meshStandardMaterial color={NAVY} roughness={0.7} />
      </mesh>
      {/* Canopy under the roof trusses. */}
      <mesh position={[0, top - 0.16, -0.1]} castShadow>
        <boxGeometry args={[w - 0.2, 0.06, d - 0.3]} />
        <meshStandardMaterial color="#141a3a" roughness={0.8} />
      </mesh>
      <Struts segments={steel} radius={0.025}>
        <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.8} />
      </Struts>
      {/* White linear light under the crossbar and a coral accent at the post feet. */}
      <mesh position={[0, top - 0.24, front - 0.2]}>
        <boxGeometry args={[w - 0.6, 0.02, 0.06]} />
        <meshBasicMaterial color={white} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.2), 0.12, front - 0.2]}>
          <boxGeometry args={[0.34, 0.18, 0.34]} />
          <meshStandardMaterial color="#f26557" roughness={0.6} />
        </mesh>
      ))}
      {/* Title fascia hung below the crossbar. */}
      <mesh position={[0, top + 0.42, front - 0.2]} castShadow>
        <boxGeometry args={[w - 0.4, 0.46, 0.08]} />
        <meshStandardMaterial color={NAVY} roughness={0.6} />
      </mesh>
      {fascia && (
        <mesh position={[0, top + 0.42, front - 0.155]}>
          <planeGeometry args={[w - 0.42, 0.44]} />
          <meshStandardMaterial map={fascia} emissive="#ffffff" emissiveMap={fascia} emissiveIntensity={0.55} roughness={0.6} />
        </mesh>
      )}
      {/* Blueprint back wall. */}
      <mesh position={[0, 1.45, back + 0.09]}>
        <planeGeometry args={[w - 0.4, 1.6]} />
        <meshStandardMaterial map={tex.print} emissive="#ffffff" emissiveMap={tex.print} emissiveIntensity={0.35} roughness={0.7} />
      </mesh>
      {/* Preliminary-concept marker at the front. */}
      <Plate
        lines={[
          { text: "تصور مبدئي", size: 88 },
          { text: "PRELIMINARY CONCEPT", size: 44, dir: "ltr" },
        ]}
        size={[0.9, 0.26]}
        position={[-w / 2 + 0.7, 0.55, front + 0.02]}
        bg="#26357a"
      />
      <Detail>
        {/* Centre plinth with the stadium miniature, cut away to show the structure. */}
        <mesh position={[0.2, 0.36, -0.15]} castShadow>
          <boxGeometry args={[1.1, 0.72, 0.8]} />
          <meshStandardMaterial color="#141a3a" roughness={0.6} />
        </mesh>
        <StadiumModel position={[0.2, 0.73, -0.15] as V3} scale={0.95} cutaway />
        <Panel
          heading="هندسة الإنشاءات"
          lines={["الأحمال والإنشاء", "تصميم المدرجات"]}
          size={[0.7, 1.05]}
          position={[-w / 2 + 0.09, 1.55, -0.2]}
          rotationY={Math.PI / 2}
          accent="#4ea649"
        />
        <Kiosk position={[w / 2 - 0.65, 0, 0.35]} rotationY={-0.6} screen={tex.screen} />
        {q.lights && <pointLight position={[0, H - 0.3, 0.2]} color="#e8eeff" intensity={9} distance={5} decay={2} />}
      </Detail>
    </group>
  );
}
