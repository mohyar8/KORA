"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CORNER_SLOTS } from "@/lib/exhibition/layout";
import { useQuality } from "../quality";
import { glowTitleTexture, plateTexture } from "../textures";
import { useAsyncTexture } from "../useAsyncTexture";
import { Plate, Screen, chamferShape, onWall, wallBetween } from "../kit/booth";
import { cardsWallTexture, funnelTexture, infographicTexture, nichesTexture } from "../kit/panels";
import { Detail, Instanced, glow, tubeAlong, useDispose, type Placement, type V3 } from "../kit/primitives";

/* ------------------------------------------------------------------ */
/* Entrepreneurship — "من الفكرة إلى الملعب"                            */
/* ------------------------------------------------------------------ */

/**
 * After references/…12.05.48 PM (2).jpeg: charcoal-navy faceted walls under
 * a louvred canopy with white LED edges, header «من الفكرة إلى الملعب»,
 * glowing title, section signs 01 «اكتشف الفرصة» / 03 «قرر»; idea cards and a
 * 6 → 4 funnel on the left, the 4 → 3 panel and a project table in the
 * centre, the 3 → 1 funnel with three ballot boxes on the right; coloured
 * flow lines on the floor. Adapted to the 3.4 × 2 m slot.
 */
const ENT = CORNER_SLOTS[2];

function flowFloorTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#1a1e2e";
  ctx.fillRect(0, 0, 512, 320);
  const cols = ["#f26557", "#4ea649", "#2d3b70", "#f2a14e", "#944399"];
  cols.forEach((col, i) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(196 + i * 30, 320);
    ctx.bezierCurveTo(196 + i * 30, 200, 60 + i * 90, 160, 30 + i * 110, 30);
    ctx.stroke();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function EntrepreneurshipCorner() {
  const q = useQuality();
  const { w, d } = ENT;
  const back = -d / 2 + 0.05;
  const L_FRONT: [number, number] = [-w / 2 + 0.05, d / 2 - 0.2];
  const L_BACK: [number, number] = [-w / 2 + 0.55, back];
  const R_BACK: [number, number] = [w / 2 - 0.55, back];
  const R_FRONT: [number, number] = [w / 2 - 0.05, d / 2 - 0.2];
  const H = 2.45;

  // Wider canvas and plane (5 : 1) so the long title stays large and whole.
  const title = useAsyncTexture(() => glowTitleTexture("ركن ريادة الأعمال", "#e9eeff", 1280, 256));
  const fun64 = useAsyncTexture(() => funnelTexture("6", "4", ["PROBLEMS", "OPPORTUNITIES"]));
  const fun43 = useAsyncTexture(() => funnelTexture("4", "3", ["OPPORTUNITIES", "VIABLE"]));
  const fun31 = useAsyncTexture(() => funnelTexture("3", "1", ["PROJECTS", "DECISION"]));
  const built = useMemo(() => {
    const walls = mergeGeometries(
      [wallBetween(L_FRONT, L_BACK, H), wallBetween(L_BACK, R_BACK, H), wallBetween(R_BACK, R_FRONT, H)].map((g) => g.toNonIndexed()),
    );
    // Louvred canopy: slats across the width + a chamfered outline with white LED.
    const slats = mergeGeometries(
      Array.from({ length: 9 }, (_, i) =>
        new THREE.BoxGeometry(w + 0.3, 0.05, 0.09).translate(0, H + 0.35, back + 0.15 + (i * (d - 0.2)) / 8).toNonIndexed(),
      ),
    );
    const frameShape = chamferShape(w + 0.4, 0.55, 0.25);
    const frame = new THREE.ExtrudeGeometry(frameShape, { depth: 0.08, bevelEnabled: false }).translate(0, H, d / 2 - 0.1);
    const led = tubeAlong(
      [
        [-(w + 0.4) / 2, H + 0.02, d / 2],
        [-(w + 0.4) / 2, H + 0.3, d / 2],
        [-(w + 0.4) / 2 + 0.25, H + 0.55, d / 2],
        [(w + 0.4) / 2 - 0.25, H + 0.55, d / 2],
        [(w + 0.4) / 2, H + 0.3, d / 2],
        [(w + 0.4) / 2, H + 0.02, d / 2],
      ],
      0.012,
    );
    const edgeLed = mergeGeometries(
      [L_FRONT, R_FRONT].map(([x, z]) => new THREE.BoxGeometry(0.03, H, 0.03).translate(x, H / 2, z + 0.05).toNonIndexed()),
    );
    const tableTop = new THREE.BoxGeometry(1.0, 0.05, 0.55);
    const leg = new THREE.BoxGeometry(0.05, 0.85, 0.05);
    const ballot = new THREE.BoxGeometry(0.22, 0.32, 0.18);
    return { walls, slats, frame, led, edgeLed, tableTop, leg, ballot, floor: flowFloorTexture(), cards: cardsWallTexture() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useDispose(...Object.values(built));

  const legs = useMemo<Placement[]>(
    () => [-0.45, 0.45].flatMap((x) => [-0.22, 0.22].map((z) => ({ p: [x, 0.47, 0.05 + z] as V3 }))),
    [],
  );
  const ballots = useMemo<Placement[]>(() => {
    return [0.25, 0.5, 0.75].map((t) => {
      const o = onWall(R_BACK, R_FRONT, t, 0.95, 0.25);
      return { p: o.position, r: o.rotationY };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const left = onWall(L_FRONT, L_BACK, 0.45, 1.45);
  const leftFunnel = onWall(L_FRONT, L_BACK, 0.85, 1.4);
  const right = onWall(R_BACK, R_FRONT, 0.5, 1.6);
  const s1 = onWall(L_FRONT, L_BACK, 0.55, 2.2, 0.06);
  const s3 = onWall(R_BACK, R_FRONT, 0.45, 2.2, 0.06);
  const white = glow("#eef3ff", 2.2);

  return (
    <group>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial map={built.floor} roughness={0.6} />
      </mesh>
      <mesh geometry={built.walls} castShadow receiveShadow>
        <meshStandardMaterial color="#262b3d" roughness={0.7} />
      </mesh>
      <mesh geometry={built.slats} castShadow>
        <meshStandardMaterial color="#1c2030" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh geometry={built.frame}>
        <meshStandardMaterial color="#1c2030" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh geometry={built.led}>
        <meshBasicMaterial color={white} toneMapped={false} />
      </mesh>
      <mesh geometry={built.edgeLed}>
        <meshBasicMaterial color={white} toneMapped={false} />
      </mesh>

      <Detail>
      {/* Left wall: idea cards + 6 → 4 funnel. */}
      <mesh position={left.position} rotation-y={left.rotationY}>
        <planeGeometry args={[0.62, 0.62]} />
        <meshStandardMaterial map={built.cards} emissive="#ffffff" emissiveMap={built.cards} emissiveIntensity={0.25} roughness={0.7} />
      </mesh>
      {fun64 && <Screen texture={fun64} size={[0.36, 0.54]} position={leftFunnel.position} rotationY={leftFunnel.rotationY} brightness={0.9} />}
      {/* Centre: 4 → 3 panel + project table. */}
      {fun43 && <Screen texture={fun43} size={[0.62, 0.93]} position={[0, 1.55, back + 0.06]} brightness={0.9} />}
      <mesh geometry={built.tableTop} position={[0, 0.9, 0.05]} castShadow>
        <meshStandardMaterial map={built.cards} roughness={0.5} />
      </mesh>
      <Instanced geometry={built.leg} items={legs}>
        <meshStandardMaterial color="#2a1f18" roughness={0.6} />
      </Instanced>
      {/* Right: 3 → 1 funnel + ballot boxes. */}
      {fun31 && <Screen texture={fun31} size={[0.5, 0.75]} position={right.position} rotationY={right.rotationY} brightness={0.9} />}
      <Instanced geometry={built.ballot} items={ballots}>
        <meshStandardMaterial color="#e9ecf2" roughness={0.4} transparent opacity={0.85} />
      </Instanced>

      <Plate lines={[{ text: "من الفكرة إلى الملعب", size: 92 }]} size={[1.5, 0.3]} position={[0, H + 0.27, d / 2 + 0.04]} bg="#1c2030" />
      <Plate lines={[{ text: "اكتشف الفرصة", size: 70 }, { text: "SPOT THE OPPORTUNITY", size: 40, dir: "ltr" }]} number="01" size={[0.78, 0.22]} position={s1.position} rotationY={s1.rotationY} bg="#1c2030" />
      <Plate lines={[{ text: "قرّر", size: 70 }, { text: "MAKE THE DECISION", size: 40, dir: "ltr" }]} number="03" size={[0.78, 0.22]} position={s3.position} rotationY={s3.rotationY} bg="#1c2030" />
      </Detail>
      {title && (
        <mesh position={[0, H + 0.95, d / 2 - 0.1]}>
          <planeGeometry args={[3.0, 0.6]} />
          <meshBasicMaterial map={title} transparent toneMapped={false} color={new THREE.Color(1.5, 1.5, 1.6)} depthWrite={false} />
        </mesh>
      )}
      {q.lights && <pointLight position={[0, H - 0.3, 0.3]} color="#fff1e0" intensity={7} distance={5} decay={2} />}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Health — "الصحة العامة للمجتمع"                                      */
/* ------------------------------------------------------------------ */

/**
 * After references/…12.05.49 PM.jpeg: dark booth outlined in cyan light
 * (toned down, per the spec's "no exaggerated neon"), trapezoid header sign,
 * lit display niches of the community health kit on the left, an arched
 * portal with an injury-prevention screen, stretcher and floor chevrons in
 * the centre, and a partner desk with a medical chair on the right. The
 * render's partner logo is replaced by a neutral «شريك صحي» plate (D-14).
 */
const HEALTH = CORNER_SLOTS[4];

async function healthHeaderTexture() {
  const tex = await plateTexture(
    [
      { text: "ركن الصحة", size: 96 },
      { text: "HEALTH CORNER", size: 54, dir: "ltr" },
      { text: "الصحة العامة للمجتمع", size: 50 },
    ],
    { width: 1024, height: 420, bg: "#0b1620", fg: "#bff4fb" },
  );
  return tex;
}

export function HealthCorner() {
  const q = useQuality();
  const { w, d } = HEALTH;
  const back = -d / 2 + 0.05;
  const H = 2.4;
  const header = useAsyncTexture(healthHeaderTexture);
  const built = useMemo(() => {
    const walls = mergeGeometries(
      [
        new THREE.BoxGeometry(w, H, 0.08).translate(0, H / 2, back),
        new THREE.BoxGeometry(0.08, H, d).translate(-w / 2 + 0.04, H / 2, 0),
        new THREE.BoxGeometry(0.08, H, d).translate(w / 2 - 0.04, H / 2, 0),
      ].map((g) => g.toNonIndexed()),
    );
    // Arched portal (chamfered) proud of the back wall, with cyan outline.
    const portal = new THREE.ExtrudeGeometry(chamferShape(1.2, 2.25, 0.35), { depth: 0.1, bevelEnabled: false }).translate(0, 0, back + 0.04);
    const outline = [
      ...[
        [-0.56, 0.05],
        [-0.56, 1.88],
        [-0.25, 2.18],
        [0.25, 2.18],
        [0.56, 1.88],
        [0.56, 0.05],
      ].map(([x, y]) => [x, y, back + 0.16] as V3),
    ];
    const portalLed = tubeAlong(outline, 0.012);
    const rimLed = mergeGeometries(
      [
        new THREE.BoxGeometry(w, 0.025, 0.025).translate(0, H, d / 2 - 0.02),
        new THREE.BoxGeometry(0.025, H, 0.025).translate(-w / 2 + 0.02, H / 2, d / 2 - 0.02),
        new THREE.BoxGeometry(0.025, H, 0.025).translate(w / 2 - 0.02, H / 2, d / 2 - 0.02),
        new THREE.BoxGeometry(w, 0.025, 0.025).translate(0, 0.08, d / 2 - 0.02),
      ].map((g) => g.toNonIndexed()),
    );
    const chevrons = mergeGeometries(
      [0, 1, 2].flatMap((i) => {
        const z = 0.15 + i * 0.25;
        return [-1, 1].map((s) => {
          const g = new THREE.BoxGeometry(0.28, 0.01, 0.05);
          g.rotateY(s * 0.6);
          g.translate(s * 0.11, 0.07, z);
          return g.toNonIndexed();
        });
      }),
    );
    const desk = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const chair = mergeGeometries(
      [
        new THREE.BoxGeometry(0.5, 0.12, 0.9).translate(0, 0.6, 0),
        new THREE.BoxGeometry(0.5, 0.1, 0.55).rotateX(-0.9).translate(0, 0.85, -0.55),
        new THREE.CylinderGeometry(0.06, 0.18, 0.55, 12).translate(0, 0.28, 0),
      ].map((g) => g.toNonIndexed()),
    );
    return {
      walls,
      portal,
      portalLed,
      rimLed,
      chevrons,
      desk,
      chair,
      niches: nichesTexture(),
      info: infographicTexture(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useDispose(...Object.values(built));
  const cyan = glow("#5fe4f2", 1.7);

  return (
    <group>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial color="#10161f" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh geometry={built.walls} castShadow receiveShadow>
        <meshStandardMaterial color="#121a24" roughness={0.65} />
      </mesh>
      <mesh geometry={built.portal} castShadow>
        <meshStandardMaterial color="#0d141c" roughness={0.6} />
      </mesh>
      <mesh geometry={built.portalLed}>
        <meshBasicMaterial color={cyan} toneMapped={false} />
      </mesh>
      <mesh geometry={built.rimLed}>
        <meshBasicMaterial color={cyan} toneMapped={false} />
      </mesh>
      <mesh geometry={built.chevrons}>
        <meshBasicMaterial color={glow("#5fe4f2", 1.3)} toneMapped={false} />
      </mesh>

      {/* Header sign above the opening. */}
      {header && (
        <mesh position={[0, H + 0.45, d / 2 - 0.05]}>
          <planeGeometry args={[1.5, 0.62]} />
          <meshStandardMaterial map={header} emissive="#ffffff" emissiveMap={header} emissiveIntensity={0.8} roughness={0.6} />
        </mesh>
      )}
      <mesh position={[0, H + 0.45, d / 2 - 0.09]}>
        <boxGeometry args={[1.56, 0.68, 0.06]} />
        <meshStandardMaterial color="#0b1620" roughness={0.6} />
      </mesh>

      <Detail>
      {/* Left: community health kit niches. */}
      <mesh position={[-w / 2 + 0.09, 1.35, -0.1]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.1, 0.55]} />
        <meshBasicMaterial map={built.niches} toneMapped={false} />
      </mesh>
      <Plate lines={[{ text: "Inside the Community Health Kit", size: 58, dir: "ltr" }]} size={[0.9, 0.14]} position={[-w / 2 + 0.1, 1.8, -0.1]} rotationY={Math.PI / 2} bg="#0b1620" fg="#bff4fb" />
      {/* Centre: injury prevention screen + stretcher inside the portal. */}
      <Screen texture={built.info} size={[0.62, 0.36]} position={[0.12, 1.5, back + 0.17]} />
      <mesh position={[-0.36, 1.05, back + 0.2]} castShadow>
        <boxGeometry args={[0.2, 1.3, 0.05]} />
        <meshStandardMaterial color="#e2672f" roughness={0.5} />
      </mesh>
      <Plate lines={[{ text: "الوقاية من الإصابات", size: 74 }]} size={[0.8, 0.14]} position={[0, 1.95, back + 0.17]} bg="#0d141c" fg="#bff4fb" />
      {/* Right: neutral partner desk + medical chair. */}
      <mesh geometry={built.desk} position={[w / 2 - 0.55, 0.45, -0.35]} castShadow>
        <meshStandardMaterial color="#1a2633" roughness={0.5} />
      </mesh>
      <Plate lines={[{ text: "شريك صحي", size: 80 }]} size={[0.6, 0.14]} position={[w / 2 - 0.55, 0.7, -0.14]} bg="#0d141c" fg="#bff4fb" />
      <mesh geometry={built.chair} position={[w / 2 - 0.5, 0, 0.45]} rotation-y={-0.8} castShadow>
        <meshStandardMaterial color="#d7dde3" roughness={0.5} />
      </mesh>
      {q.lights && <pointLight position={[0, H - 0.4, 0.2]} color="#dff8ff" intensity={7} distance={5} decay={2} />}
      </Detail>
    </group>
  );
}
