"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SEATING, STAGE } from "@/lib/exhibition/layout";
import { useQuality } from "../quality";
import { portraitLogoTexture, radialTexture, raysTexture, stageScreenTexture } from "../textures";
import { useAsyncTexture } from "../useAsyncTexture";
import { Instanced, Struts, arcPoints, glow, truss, tubeAlong, type Placement, type Segment, type V3 } from "../kit/primitives";

/**
 * Main stage + amphitheatre, after the "Stage & Theater" renders
 * (references/…12.05.49 PM (6).jpeg) inside the masterplan footprint:
 * 12 × 5 m deck with a curved apron and warm under-lip light, wide LED wall
 * with the official lockup, angled side screens, line arrays and gold light
 * bars, portrait logo panels, box-truss roof grid with fixtures and
 * restrained blue beams, a KORA lectern; stone tiers with navy cushions and
 * warm nosing lights, and a front lounge row of armchairs.
 *
 * Local frame: origin at the deck centre on the ground, +Z towards the
 * audience (south). Not reproduced from the render: its background building
 * (different site, R-8) and the screen tagline (copy not approved).
 */

const W = STAGE.width;
const D = STAGE.depth;
const H = STAGE.deckHeight;
const BACK = -D / 2;
const SAG = 1.5; // apron bulge
const R_APRON = ((W / 2) ** 2 + SAG ** 2) / (2 * SAG);
const APRON_CZ = D / 2 - R_APRON;
const A0 = Math.acos(W / 2 / R_APRON);
const A1 = Math.PI - A0;
const SIDE_Z = APRON_CZ + R_APRON * Math.sin(A0);

const TOWER_X = 7.8;
const FRONT_Z = 0.9;
const BACK_Z = BACK + 0.3;
const ROOF_Y = 7.3;

const SCREEN = { w: 9.2, h: 4.3, y0: 1.2, z: BACK + 0.15 };

const WARM = "#ffb067";
const BLUE = "#6f9bff";

function deckGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-W / 2, BACK);
  s.lineTo(W / 2, BACK);
  s.lineTo(W / 2, SIDE_Z);
  for (const [x, , z] of arcPoints(0, APRON_CZ, R_APRON, A0, A1, 0, 32)) s.lineTo(x, z);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: H, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(Math.PI / 2);
  g.translate(0, H, 0);
  return g;
}

/** Side stairs at both front corners, descending outward. */
function stairs() {
  const boxes: THREE.BufferGeometry[] = [];
  const nosings: Placement[] = [];
  const steps = 4;
  const tread = 0.35;
  const rise = H / steps;
  for (const side of [-1, 1])
    for (let k = 0; k < steps; k++) {
      const outer = W / 2 + tread * (steps - k);
      const h = rise * (k + 1);
      const g = new THREE.BoxGeometry(outer - W / 2, h, 1.6);
      g.translate(side * (W / 2 + (outer - W / 2) / 2), h / 2, 0.45);
      boxes.push(g);
      nosings.push({ p: [side * (outer - 0.02), h - 0.015, 0.45] });
    }
  return { geometry: mergeGeometries(boxes), nosings };
}

function roofTruss(): Segment[] {
  const y = ROOF_Y;
  return [
    // Four towers.
    ...truss([-TOWER_X, 0, BACK_Z], [-TOWER_X, y + 0.2, BACK_Z], 0.4, 0.55),
    ...truss([TOWER_X, 0, BACK_Z], [TOWER_X, y + 0.2, BACK_Z], 0.4, 0.55),
    ...truss([-TOWER_X, 0, FRONT_Z], [-TOWER_X, y + 0.2, FRONT_Z], 0.4, 0.55),
    ...truss([TOWER_X, 0, FRONT_Z], [TOWER_X, y + 0.2, FRONT_Z], 0.4, 0.55),
    // Roof grid.
    ...truss([-TOWER_X, y, FRONT_Z], [TOWER_X, y, FRONT_Z], 0.3, 0.5),
    ...truss([-TOWER_X, y, BACK_Z], [TOWER_X, y, BACK_Z], 0.3, 0.5),
    ...truss([-TOWER_X, y, BACK_Z], [-TOWER_X, y, FRONT_Z], 0.3, 0.5),
    ...truss([TOWER_X, y, BACK_Z], [TOWER_X, y, FRONT_Z], 0.3, 0.5),
    ...truss([-2.6, y, BACK_Z], [-2.6, y, FRONT_Z], 0.3, 0.5),
    ...truss([2.6, y, BACK_Z], [2.6, y, FRONT_Z], 0.3, 0.5),
    // Mid lighting bar.
    ...truss([-TOWER_X, y, (BACK_Z + FRONT_Z) / 2], [TOWER_X, y, (BACK_Z + FRONT_Z) / 2], 0.3, 0.5),
  ];
}

/** Soft light shafts: thin open cones with alpha fading along their length (one merged draw). */
function beamsGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const add = (from: V3, to: V3, r0: number, r1: number) => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const len = a.distanceTo(b);
    const g = new THREE.CylinderGeometry(r0, r1, len, 18, 6, true);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      // y: +len/2 at the source end.
      // Clamp: float error at the tip would give pow(negative) = NaN, which
      // the bloom pass then spreads over the whole frame.
      const t = THREE.MathUtils.clamp(0.5 - pos.getY(i) / len, 0, 1);
      const f = Math.pow(1 - t, 1.6);
      col.set([f, f, f], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.deleteAttribute("uv");
    g.deleteAttribute("normal");
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), b.clone().sub(a).normalize());
    g.applyQuaternion(q);
    const mid = a.clone().lerp(b, 0.5);
    g.translate(mid.x, mid.y, mid.z);
    parts.push(g);
  };
  // From the front roof truss, crossing down onto the deck.
  for (const [x0, x1] of [
    [-5.5, -1.5],
    [-3, 2.5],
    [-0.8, -3.5],
    [1.2, 4],
    [3.4, -0.5],
    [5.6, 2],
  ] as const)
    add([x0, ROOF_Y - 0.35, FRONT_Z], [x1, H, -0.6], 0.06, 0.55);
  // From the deck-edge fixtures, fanning up into the night.
  for (const [x0, x1] of [
    [-4, -7],
    [-1.5, 1.5],
    [1.5, -1],
    [4, 7.5],
  ] as const)
    add([x0, H + 0.3, 1.6], [x1, 11, -6], 0.05, 0.7);
  return mergeGeometries(parts);
}

function armchairGeometry() {
  const parts = [
    new THREE.BoxGeometry(0.62, 0.22, 0.62).translate(0, 0.32, 0.02),
    new THREE.BoxGeometry(0.78, 0.5, 0.16).translate(0, 0.62, -0.31),
    new THREE.BoxGeometry(0.12, 0.38, 0.72).translate(-0.33, 0.4, 0),
    new THREE.BoxGeometry(0.12, 0.38, 0.72).translate(0.33, 0.4, 0),
    new THREE.BoxGeometry(0.7, 0.2, 0.7).translate(0, 0.1, 0),
  ].map((g) => g.toNonIndexed());
  return mergeGeometries(parts);
}

/** Annular sector solid in the seating frame (centre = SEATING.center). */
function sector(r0: number, r1: number, a0: number, a1: number, h: number, cx: number, cz: number) {
  const s = new THREE.Shape();
  const n = 20;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    if (i === 0) s.moveTo(cx + Math.cos(a) * r0, cz + Math.sin(a) * r0);
    else s.lineTo(cx + Math.cos(a) * r0, cz + Math.sin(a) * r0);
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    s.lineTo(cx + Math.cos(a) * r1, cz + Math.sin(a) * r1);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(Math.PI / 2);
  g.translate(0, h, 0);
  return g;
}

function amphitheatre() {
  // Seating centre in the stage frame.
  const cx = SEATING.center.x - STAGE.centerX;
  const cz = SEATING.center.z - STAGE.centerZ;
  const bands = 5;
  const band = (SEATING.outerRadius - SEATING.innerRadius) / bands;
  const rise = 0.42;
  const stone: THREE.BufferGeometry[] = [];
  const platform: THREE.BufferGeometry[] = [];
  const strips: THREE.BufferGeometry[] = [];
  const cushions: Placement[] = [];
  const chairs: Placement[] = [];
  const tables: Placement[] = [];
  for (const { from, to } of SEATING.blocks) {
    // Band 0: lounge platform with armchairs facing the stage.
    const r0 = SEATING.innerRadius;
    platform.push(sector(r0, r0 + band, from, to, 0.12, cx, cz));
    strips.push(tubeAlong(arcPoints(cx, cz, r0 - 0.02, from, to, 0.06, 20), 0.02));
    // Regular lounge groups (chair · chair · side table) centred on the arc,
    // with equal gaps; every piece turned to face the stage centre.
    const rc = r0 + band * 0.5;
    const arcLen = (to - from) * rc;
    const pattern: ("chair" | "table")[] = ["chair", "chair", "table"];
    const widths = { chair: 0.8, table: 0.5 };
    const SP = 0.12;
    const groupW = pattern.reduce((w, k) => w + widths[k], 0) + SP * (pattern.length - 1);
    const gap = 0.4;
    const groups = Math.max(1, Math.floor((arcLen - 0.4 + gap) / (groupW + gap)));
    const used = groups * groupW + (groups - 1) * gap;
    let s = (arcLen - used) / 2;
    for (let g = 0; g < groups; g++) {
      for (const kind of pattern) {
        const mid = s + widths[kind] / 2;
        const a = from + mid / rc;
        const p: V3 = [cx + Math.cos(a) * rc, 0.12, cz + Math.sin(a) * rc];
        const face = Math.atan2(-p[0], -p[2]); // towards the stage centre (frame origin)
        (kind === "chair" ? chairs : tables).push({ p, r: face });
        s += widths[kind] + SP;
      }
      s += gap - SP;
    }
    // Bands 1–4: stone tiers rising away from the stage.
    for (let b = 1; b < bands; b++) {
      const ri = SEATING.innerRadius + band * b;
      const h = rise * b;
      stone.push(sector(ri, ri + band, from, to, h, cx, cz));
      strips.push(tubeAlong(arcPoints(cx, cz, ri - 0.03, from, to, h - 0.05, 20), 0.018));
      const rm = ri + band * 0.55;
      const m = Math.floor(((to - from) * rm) / 1.55);
      for (let i = 0; i < m; i++) {
        const a = from + ((i + 0.5) / m) * (to - from);
        cushions.push({
          p: [cx + Math.cos(a) * rm, h + 0.08, cz + Math.sin(a) * rm],
          r: -(a + Math.PI / 2),
        });
      }
    }
  }
  const clean = (g: THREE.BufferGeometry) => {
    g.deleteAttribute("uv");
    return g;
  };
  return {
    stone: mergeGeometries(stone.map(clean)),
    platform: mergeGeometries(platform.map(clean)),
    strips: mergeGeometries(strips.map((g) => clean(g.toNonIndexed()))),
    cushions,
    chairs,
    tables,
  };
}

export function StageModel() {
  const q = useQuality();
  const screen = useAsyncTexture(stageScreenTexture);
  const portrait = useAsyncTexture(portraitLogoTexture);

  const built = useMemo(() => {
    const deck = deckGeometry();
    const lip = tubeAlong(
      [
        [W / 2 + 0.03, 0.05, BACK + 0.2],
        [W / 2 + 0.03, 0.05, SIDE_Z],
        ...arcPoints(0, APRON_CZ, R_APRON + 0.03, A0, A1, 0.05, 32).slice(1, -1),
        [-W / 2 - 0.03, 0.05, SIDE_Z],
        [-W / 2 - 0.03, 0.05, BACK + 0.2],
      ],
      0.03,
    );
    const st = stairs();
    const rays = raysTexture(7);
    const pool = radialTexture();
    const amph = amphitheatre();
    return {
      deck,
      lip,
      stairs: st.geometry,
      nosings: st.nosings,
      roof: roofTruss(),
      beams: beamsGeometry(),
      rays,
      pool,
      amph,
      chair: armchairGeometry(),
      table: new THREE.BoxGeometry(0.55, 0.5, 0.55).translate(0, 0.25, 0),
      cushion: new THREE.BoxGeometry(1.25, 0.15, 0.72),
      nosing: new THREE.BoxGeometry(0.03, 0.02, 1.6),
      speaker: new THREE.BoxGeometry(0.85, 0.34, 0.6),
      fixture: new THREE.CylinderGeometry(0.13, 0.16, 0.34, 10),
      lens: new THREE.CircleGeometry(0.1, 12).rotateX(Math.PI / 2),
      gobo: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    };
  }, []);
  useEffect(
    () => () => {
      const { roof: _r, nosings: _n, amph, ...rest } = built;
      void _r;
      void _n;
      Object.values(rest).forEach((v) => (v as { dispose?: () => void }).dispose?.());
      amph.stone.dispose();
      amph.platform.dispose();
      amph.strips.dispose();
    },
    [built],
  );

  const roofFixtures = useMemo<Placement[]>(() => {
    const out: Placement[] = [];
    for (const z of [FRONT_Z, (BACK_Z + FRONT_Z) / 2])
      for (let i = 0; i < 11; i++) out.push({ p: [-6.5 + i * 1.3, ROOF_Y - 0.35, z] });
    return out;
  }, []);
  const deckFixtures = useMemo<Placement[]>(
    () =>
      arcPoints(0, APRON_CZ, R_APRON - 0.45, A0 + 0.06, A1 - 0.06, H + 0.17, 8).map((p) => ({ p })),
    [],
  );
  const lineArrays = useMemo<Placement[]>(
    () =>
      [-1, 1].flatMap((side) =>
        Array.from({ length: 7 }, (_, i) => ({
          p: [side * 6.75, ROOF_Y - 0.9 - i * 0.36, -1.3] as V3,
          rx: 0.03 * i,
        })),
      ),
    [],
  );
  const groundStacks = useMemo<Placement[]>(
    () => [-1, 1].flatMap((side) => [0, 1, 2].map((k) => ({ p: [side * 6.85, 0.17 + k * 0.35, -1.3] as V3 }))),
    [],
  );
  const gobos = useMemo<Placement[]>(
    () =>
      [
        [-3.5, -0.3],
        [-1.2, 0.6],
        [1.3, -0.5],
        [3.6, 0.5],
        [0, 1.6],
      ].map(([x, z]) => ({ p: [x, H + 0.012, z] as V3, s: [1.6, 1, 1.6] as V3 })),
    [],
  );

  const warm = glow(WARM, 2.6);
  const black = "#0b0c10";

  return (
    <group>
      {/* Deck, warm under-lip light and side stairs. */}
      <mesh geometry={built.deck} castShadow receiveShadow>
        <meshStandardMaterial color="#121319" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh geometry={built.lip}>
        <meshBasicMaterial color={warm} toneMapped={false} />
      </mesh>
      <mesh geometry={built.stairs} castShadow receiveShadow>
        <meshStandardMaterial color="#15161c" roughness={0.6} />
      </mesh>
      <Instanced geometry={built.nosing} items={built.nosings}>
        <meshBasicMaterial color={glow(WARM, 2)} toneMapped={false} />
      </Instanced>
      <Instanced geometry={built.gobo} items={gobos}>
        <meshBasicMaterial
          map={built.pool}
          color={BLUE}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Instanced>

      {/* LED wall + housing. */}
      <mesh position={[0, SCREEN.y0 + SCREEN.h / 2, SCREEN.z - 0.12]} castShadow>
        <boxGeometry args={[SCREEN.w + 0.3, SCREEN.h + 0.3, 0.2]} />
        <meshStandardMaterial color={black} roughness={0.7} />
      </mesh>
      {screen && (
        <mesh position={[0, SCREEN.y0 + SCREEN.h / 2, SCREEN.z]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial map={screen} color={new THREE.Color(1.15, 1.15, 1.2)} toneMapped={false} />
        </mesh>
      )}
      {/* Angled side screens. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 5.75, SCREEN.y0 + SCREEN.h / 2, BACK + 0.45]} rotation-y={-side * 0.32}>
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[2.25, SCREEN.h + 0.2, 0.16]} />
            <meshStandardMaterial color={black} roughness={0.7} />
          </mesh>
          <mesh>
            <planeGeometry args={[2.1, SCREEN.h]} />
            <meshBasicMaterial map={built.rays} color={new THREE.Color(1.05, 1.05, 1.1)} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Outer portrait logo panels on the back towers. */}
      {portrait &&
        [-1, 1].map((side) => (
          <group key={side} position={[side * (TOWER_X + 0.05), 3.4, BACK_Z + 0.32]}>
            <mesh position={[0, 0, -0.06]}>
              <boxGeometry args={[1.32, 4.3, 0.1]} />
              <meshStandardMaterial color={black} roughness={0.7} />
            </mesh>
            <mesh>
              <planeGeometry args={[1.2, 4.2]} />
              <meshBasicMaterial map={portrait} toneMapped={false} />
            </mesh>
          </group>
        ))}
      {/* Gold vertical light bars (batched with the other warm strips). */}
      {[-7.15, -7.35, 7.15, 7.35].map((x) => (
        <mesh key={x} position={[x, 2.9, BACK_Z + 0.1]}>
          <boxGeometry args={[0.05, 5.4, 0.05]} />
          <meshBasicMaterial color={glow("#ffc27a", 2.2)} toneMapped={false} />
        </mesh>
      ))}
      {/* Line arrays and ground stacks. */}
      <Instanced geometry={built.speaker} items={[...lineArrays, ...groundStacks]} castShadow>
        <meshStandardMaterial color="#0d0e12" roughness={0.75} />
      </Instanced>

      {/* Roof truss and fixtures. */}
      <Struts segments={built.roof} radius={0.024}>
        <meshStandardMaterial color="#1a1b20" roughness={0.45} metalness={0.7} />
      </Struts>
      <Instanced geometry={built.fixture} items={[...roofFixtures, ...deckFixtures]}>
        <meshStandardMaterial color="#121318" roughness={0.5} metalness={0.5} />
      </Instanced>
      <Instanced
        geometry={built.lens}
        items={[
          ...roofFixtures.map((f) => ({ p: [f.p[0], f.p[1] - 0.18, f.p[2]] as V3 })),
          ...deckFixtures.map((f) => ({ p: [f.p[0], f.p[1] + 0.18, f.p[2]] as V3, rx: Math.PI })),
        ]}
      >
        <meshBasicMaterial color={glow("#cfe0ff", 3)} toneMapped={false} side={THREE.DoubleSide} />
      </Instanced>
      <mesh geometry={built.beams} renderOrder={4}>
        <meshBasicMaterial
          color={BLUE}
          vertexColors
          transparent
          opacity={0.032}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lectern with the official lockup. */}
      <group position={[-3.4, H, 1.15]}>
        <mesh position={[0, 0.56, 0]} castShadow>
          <boxGeometry args={[0.62, 1.12, 0.44]} />
          <meshStandardMaterial color="#0e0f14" roughness={0.6} />
        </mesh>
        {portrait && (
          <mesh position={[0, 0.6, 0.225]}>
            <planeGeometry args={[0.5, 0.88]} />
            <meshBasicMaterial map={portrait} toneMapped={false} />
          </mesh>
        )}
      </group>

      {q.lights && (
        <spotLight
          position={[0, ROOF_Y - 0.5, 2.6]}
          angle={0.75}
          penumbra={0.7}
          intensity={90}
          distance={20}
          decay={2}
          color="#b9ccff"
          onUpdate={(l) => {
            l.target.position.set(0, H, -0.5);
            l.target.updateMatrixWorld();
          }}
        />
      )}

      {/* Amphitheatre. */}
      <mesh geometry={built.amph.stone} castShadow receiveShadow>
        <meshStandardMaterial color="#a8927a" roughness={0.82} />
      </mesh>
      <mesh geometry={built.amph.platform} receiveShadow>
        <meshStandardMaterial color="#121216" roughness={0.9} />
      </mesh>
      <mesh geometry={built.amph.strips}>
        <meshBasicMaterial color={glow(WARM, 2.3)} toneMapped={false} />
      </mesh>
      <Instanced geometry={built.cushion} items={built.amph.cushions}>
        <meshStandardMaterial color="#1b2244" roughness={0.85} />
      </Instanced>
      <Instanced geometry={built.chair} items={built.amph.chairs} castShadow>
        <meshStandardMaterial color="#d8ccb6" roughness={0.9} />
      </Instanced>
      <Instanced geometry={built.table} items={built.amph.tables}>
        <meshStandardMaterial color="#111114" roughness={0.5} metalness={0.3} />
      </Instanced>
    </group>
  );
}
