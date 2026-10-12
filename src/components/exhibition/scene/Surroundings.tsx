"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  BUILDINGS,
  ENTERTAINMENT,
  MUSEUM,
  MUSEUM_PATH_PLANTERS,
  PASSAGE,
  PLAZA,
  SOUTH_PALMS,
  WEST_PLANTERS,
} from "@/lib/exhibition/layout";
import { concreteTexture, frondTexture, passageSignTexture, radialTexture, rng, windowTexture } from "./textures";
import { useAsyncTexture } from "./useAsyncTexture";
import { useQuality } from "./quality";

/**
 * The real campus context, authored (not copied) from the site photos and
 * satellite view: the precast academic buildings 70 / 57, palm planters and
 * lanterns from the masterplan, plaza disc-lamps, stone benches and the
 * dense tree belt around the plaza.
 */

type Placement = { p: [number, number, number]; s?: [number, number, number]; r?: number };

function Instances({
  geometry,
  items,
  children,
  castShadow,
}: {
  geometry: THREE.BufferGeometry;
  items: Placement[];
  children: React.ReactNode;
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
      e.set(0, it.r ?? 0, 0);
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

/* ------------------------------------------------------------------ */
/* Academic buildings                                                  */
/* ------------------------------------------------------------------ */

const FLOOR = 3.5;
const PLINTH = 1.6;
const TOP_BAND = 1.4;
const BAY = 2.4;

function bayTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 80;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#a99b86";
  ctx.fillRect(0, 0, 64, 80);
  ctx.fillStyle = "#1b2029";
  ctx.fillRect(6, 10, 52, 46);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(6, 10, 52, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function AcademicBuilding({
  minX,
  maxX,
  minZ,
  maxZ,
  height,
  seed,
  concrete,
}: {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
  seed: number;
  concrete: THREE.Texture;
}) {
  const length = maxX - minX;
  const depth = maxZ - minZ;
  const floors = Math.round((height - PLINTH - TOP_BAND) / FLOOR);
  const cols = Math.round(length / BAY);
  const frontZ = maxZ;
  const glassZ = frontZ - 1.0;

  const { bays, lit } = useMemo(() => {
    const bays = bayTexture();
    bays.repeat.set(cols, floors);
    const lit = windowTexture(cols, floors, seed);
    return { bays, lit };
  }, [cols, floors, seed]);
  useEffect(
    () => () => {
      bays.dispose();
      lit.dispose();
    },
    [bays, lit],
  );

  const fin = useMemo(() => new THREE.BoxGeometry(0.42, floors * FLOOR, 1.0), [floors]);
  const fins = useMemo<Placement[]>(
    () =>
      Array.from({ length: cols + 1 }, (_, i) => ({
        p: [minX + i * (length / cols), PLINTH + (floors * FLOOR) / 2, frontZ - 0.5],
      })),
    [cols, minX, length, floors, frontZ],
  );
  const posts = useMemo<Placement[]>(
    () =>
      Array.from({ length: Math.floor(length / 1.6) }, (_, i) => ({
        p: [minX + 0.8 + i * 1.6, 0.9 + 0.5, frontZ + 3.4],
      })),
    [minX, length, frontZ],
  );
  const postGeo = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 1, 6), []);

  return (
    <group>
      {/* Core volume (recessed behind the facade grid). */}
      <mesh position={[(minX + maxX) / 2, height / 2, (minZ + glassZ) / 2]} castShadow receiveShadow>
        <boxGeometry args={[length, height, glassZ - minZ]} />
        <meshStandardMaterial map={concrete} color="#a39a8e" roughness={0.92} envMapIntensity={0.5} />
      </mesh>
      {/* Window wall with lit rooms. */}
      <mesh position={[(minX + maxX) / 2, PLINTH + (floors * FLOOR) / 2, glassZ + 0.01]}>
        <planeGeometry args={[length, floors * FLOOR]} />
        <meshStandardMaterial
          map={bays}
          emissive="#ffffff"
          emissiveMap={lit}
          emissiveIntensity={1.3}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>
      {/* Deep precast grid: floor slabs, fins, plinth and top band. */}
      {Array.from({ length: floors + 1 }, (_, k) => (
        <mesh key={k} position={[(minX + maxX) / 2, PLINTH + k * FLOOR, frontZ - 0.5]} castShadow receiveShadow>
          <boxGeometry args={[length + 0.42, 0.36, 1.0]} />
          <meshStandardMaterial map={concrete} color="#a39a8e" roughness={0.9} envMapIntensity={0.5} />
        </mesh>
      ))}
      <Instances geometry={fin} items={fins} castShadow>
        <meshStandardMaterial map={concrete} color="#a39a8e" roughness={0.9} envMapIntensity={0.5} />
      </Instances>
      <mesh position={[(minX + maxX) / 2, height - TOP_BAND / 2 + 0.2, frontZ - 0.5]} castShadow>
        <boxGeometry args={[length + 0.42, TOP_BAND + 0.4, 1.0]} />
        <meshStandardMaterial map={concrete} color="#a39a8e" roughness={0.9} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[(minX + maxX) / 2, PLINTH / 2, frontZ - 0.5]}>
        <boxGeometry args={[length + 0.42, PLINTH, 1.0]} />
        <meshStandardMaterial color="#8f8574" roughness={0.95} />
      </mesh>
      {/* Raised podium with railing, as in the photos. */}
      <mesh position={[(minX + maxX) / 2, 0.45, frontZ + 1.75]} receiveShadow>
        <boxGeometry args={[length, 0.9, 3.5]} />
        <meshStandardMaterial color="#9b917f" roughness={0.95} />
      </mesh>
      <mesh position={[(minX + maxX) / 2, 1.9, frontZ + 3.4]}>
        <boxGeometry args={[length - 0.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#9a9ca3" roughness={0.35} metalness={0.8} />
      </mesh>
      <Instances geometry={postGeo} items={posts}>
        <meshStandardMaterial color="#9a9ca3" roughness={0.35} metalness={0.8} />
      </Instances>
      {/* Plain side and rear walls are the core box; add a roof parapet line. */}
      <mesh position={[(minX + maxX) / 2, height + 0.3, (minZ + maxZ) / 2 - 0.5]}>
        <boxGeometry args={[length + 0.42, 0.6, depth - 1]} />
        <meshStandardMaterial map={concrete} color="#a39a8e" roughness={0.9} envMapIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Vegetation                                                          */
/* ------------------------------------------------------------------ */

/** A tree crown as a loose cluster of noisy lobes (reads better in silhouette than one blob). */
function crownGeometry(detail: number) {
  const r = rng(17);
  const lobes = Array.from({ length: 5 }, (_, i) => {
    const g = canopyGeometry(detail);
    const s = 0.55 + r() * 0.3;
    const a = (i / 5) * Math.PI * 2 + r();
    g.scale(s, s * 0.9, s);
    g.translate(Math.cos(a) * 0.45, (r() - 0.3) * 0.5, Math.sin(a) * 0.45);
    return g;
  });
  const top = canopyGeometry(detail);
  top.scale(0.6, 0.6, 0.6);
  top.translate(0, 0.45, 0);
  return mergeGeometries([...lobes, top]);
}

function canopyGeometry(detail = 2) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position;
  const r = rng(3);
  const v = new THREE.Vector3();
  const noise = Array.from({ length: 24 }, () => [r(), r(), r(), r()]);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let d = 0;
    for (const [a, b, c, ph] of noise) d += Math.sin(v.x * (3 + a * 5) + v.y * (3 + b * 5) + v.z * (3 + c * 5) + ph * 6) * 0.035;
    v.multiplyScalar(1 + d);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** A clipped hedge block (0.8 × 0.45 × 2 m) with a softly irregular surface. */
function hedgeGeometry() {
  const g = new THREE.BoxGeometry(0.8, 0.45, 2, 4, 3, 10);
  const pos = g.attributes.position;
  const r = rng(29);
  const offsets = Array.from({ length: 64 }, () => (r() - 0.5) * 0.05);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = offsets[Math.abs(Math.round(x * 7 + y * 13 + z * 5)) % 64];
    // Rounded shoulders + leafy jitter.
    const k = 1 - 0.12 * Math.max(0, y / 0.225) ** 2;
    pos.setXYZ(i, x * k + n, y + n * 0.6 + 0.225, z + n * 0.3);
  }
  g.computeVertexNormals();
  return g;
}

function palmCrownGeometry() {
  const fronds: THREE.BufferGeometry[] = [];
  const count = 16;
  for (let i = 0; i < count; i++) {
    const g = new THREE.PlaneGeometry(3.1, 0.8, 8, 1);
    g.translate(1.55, 0, 0);
    const pos = g.attributes.position;
    // Upper fronds rise, lower ones droop.
    const lift = -0.15 + ((i * 7) % 5) * 0.2;
    for (let j = 0; j < pos.count; j++) {
      const x = pos.getX(j);
      const w = pos.getY(j);
      pos.setXYZ(j, x, lift * x - 0.16 * x * x + Math.abs(w) * 0.25, w * 0.9);
    }
    g.computeVertexNormals();
    g.rotateY((i / count) * Math.PI * 2 + (i % 2) * 0.15);
    fronds.push(g);
  }
  return mergeGeometries(fronds);
}

function palmTrunkGeometry() {
  const g = new THREE.CylinderGeometry(0.15, 0.24, 1, 8, 8);
  g.translate(0, 0.5, 0);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setX(i, pos.getX(i) + 0.35 * y * y);
  }
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Placement                                                           */
/* ------------------------------------------------------------------ */

function treeBelt(count: number) {
  const r = rng(41);
  const out: { x: number; z: number; h: number; c: number }[] = [];
  const zones: [number, number, number, number, number][] = [
    // minX, maxX, minZ, maxZ, share
    [-40, 110, 70, 84, 0.34],
    [86, 104, -30, 70, 0.26],
    [-46, -24, -10, 70, 0.22],
    // North belt, leaving the (provisional) entertainment zone open.
    [-40, 6, -44, -30, 0.08],
    [48, 110, -44, -30, 0.1],
    [-40, 110, -72, -60, 0.12],
  ];
  for (const [x0, x1, z0, z1, share] of zones) {
    const n = Math.round(count * share);
    for (let i = 0; i < n; i++)
      out.push({
        x: x0 + r() * (x1 - x0),
        z: z0 + r() * (z1 - z0),
        h: 4 + r() * 3,
        c: 2.2 + r() * 1.6,
      });
  }
  return out;
}

const MX = MUSEUM.facadeX;
const MZ = MUSEUM.northZ;

/** Palms standing in their own square planters. */
const POTTED_PALMS: [number, number][] = [
  // East edge behind the museum (masterplan right-hand palm row).
  ...Array.from({ length: 7 }, (_, i) => [MX + MUSEUM.depth + 3.2, MZ - 1 + i * 5] as [number, number]),
  // North edge between the plaza and Buildings 70/57.
  [4, -1.8], [14, -1.8], [36, -1.8], [44, -1.8],
  // South edge behind the corners (masterplan).
  ...SOUTH_PALMS.xs.map((x) => [x, SOUTH_PALMS.z] as [number, number]),
];

/** Palms growing out of the long planter strips (masterplan). */
const STRIP_PALMS: [number, number][] = [
  ...MUSEUM_PATH_PLANTERS.palms.map((z) => [MUSEUM_PATH_PLANTERS.x, z] as [number, number]),
  ...WEST_PLANTERS.palms.map((z) => [WEST_PLANTERS.x, z] as [number, number]),
];

const PALMS: [number, number][] = [...POTTED_PALMS, ...STRIP_PALMS];
const PLANTERS: [number, number][] = POTTED_PALMS;

/** Long planter strips [x, z0, z1]: museum path column and the west column (gap = entrance). */
const STRIPS: [number, number, number][] = [
  ...MUSEUM_PATH_PLANTERS.runs.map(([z0, z1]) => [MUSEUM_PATH_PLANTERS.x, z0, z1] as [number, number, number]),
  [WEST_PLANTERS.x, 0.5, PLAZA.entrance.z - 1.8],
  [WEST_PLANTERS.x, PLAZA.entrance.z + 1.8, 34.5],
];

const DISC_LAMPS: [number, number][] = [
  [-6, 44], [6, 50], [18, 44], [30, 50], [42, 44], [54, 50], [66, 44],
  [-8, 10], [-8, 26], [68, 8], [68, 22], [70, 36], [12, 58], [36, 58], [60, 58],
  // Around the (provisional) entertainment zone.
  [9, -31], [27, -29.5], [45, -31], [9, -55], [27, -56.5], [45, -55],
];

const BOLLARDS: [number, number][] = [
  ...[0, 6, 12, 18, 32, 38, 50, 56].map((x) => [x, -0.6] as [number, number]),
  ...Array.from({ length: 8 }, (_, i) => [MX + MUSEUM.depth + 1.6, MZ + i * 4] as [number, number]),
  ...[2, 10, 17.5, 22, 27, 32, 50].map((x) => [x, 38.7] as [number, number]),
  // Lanterns along the museum-path planter strip (masterplan).
  ...[4.5, 9, 13.5, 21, 26, 30.5].map((z) => [MUSEUM_PATH_PLANTERS.x + 0.9, z] as [number, number]),
];

const BENCHES: Placement[] = [
  { p: [8, 0, 46], r: 0 },
  { p: [32, 0, 46], r: 0 },
  { p: [56, 0, 52], r: Math.PI / 2 },
  { p: [66, 0, 30], r: Math.PI / 2 },
  { p: [-4, 0, 18], r: Math.PI / 2 },
];

const ROAD_LIGHTS: [number, number][] = [
  ...Array.from({ length: 8 }, (_, i) => [108, -30 + i * 18] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => [-30 + i * 22, 92] as [number, number]),
];

export function Surroundings() {
  const q = useQuality();

  const tex = useMemo(
    () => ({
      concrete: (() => {
        const t = concreteTexture(256);
        t.repeat.set(6, 3);
        return t;
      })(),
      frond: frondTexture(),
      pool: radialTexture(),
    }),
    [],
  );
  const geo = useMemo(
    () => ({
      canopy: crownGeometry(2),
      farCanopy: crownGeometry(1),
      trunk: (() => {
        const g = new THREE.CylinderGeometry(0.12, 0.2, 1, 6);
        g.translate(0, 0.5, 0);
        return g;
      })(),
      palmTrunk: palmTrunkGeometry(),
      crown: palmCrownGeometry(),
      planter: new THREE.BoxGeometry(1.6, 0.7, 1.6).translate(0, 0.35, 0),
      strip: new THREE.BoxGeometry(1.0, 0.55, 1).translate(0, 0.275, 0),
      hedge: hedgeGeometry(),
      shrub: canopyGeometry(2),
      pole: new THREE.CylinderGeometry(0.06, 0.08, 1, 8).translate(0, 0.5, 0),
      disc: new THREE.CylinderGeometry(0.5, 0.42, 0.1, 24),
      discGlow: new THREE.CircleGeometry(0.4, 24).rotateX(Math.PI / 2),
      bollard: new THREE.BoxGeometry(0.2, 0.75, 0.2).translate(0, 0.375, 0),
      bollardHead: new THREE.BoxGeometry(0.22, 0.14, 0.22),
      pool: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      benchLeg: new THREE.BoxGeometry(0.42, 0.4, 0.42).translate(0, 0.2, 0),
      benchTop: new THREE.BoxGeometry(2.2, 0.1, 0.55).translate(0, 0.45, 0),
      roadPole: new THREE.CylinderGeometry(0.09, 0.12, 9, 6).translate(0, 4.5, 0),
      roadHead: new THREE.SphereGeometry(0.25, 10, 8),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(tex).forEach((t) => t.dispose());
      Object.values(geo).forEach((g) => g.dispose());
    },
    [tex, geo],
  );

  const trees = useMemo(() => treeBelt(q.treeCount), [q.treeCount]);
  const farTrees = useMemo(() => {
    // Distant campus greenery: breaks the flat horizon line.
    const r = rng(77);
    return Array.from({ length: Math.round(q.treeCount * 0.8) }, () => {
      const a = r() * Math.PI * 2;
      const d = 130 + r() * 70;
      const c = 3 + r() * 2.5;
      const h = 5 + r() * 4;
      return { p: [30 + Math.cos(a) * d, h + c * 0.6, 20 + Math.sin(a) * d] as [number, number, number], s: [c, c * 1.3, c] as [number, number, number], r: a };
    });
  }, [q.treeCount]);
  const items = useMemo(() => {
    const r = rng(9);
    return {
      trunks: trees.map<Placement>((t) => ({ p: [t.x, 0, t.z], s: [1, t.h, 1] })),
      canopies: trees.map<Placement>((t) => ({
        p: [t.x, t.h + t.c * 0.7, t.z],
        s: [t.c, t.c * 1.35, t.c],
        r: r() * 6,
      })),
      palmTrunks: PALMS.map<Placement>(([x, z], i) => ({
        p: [x, 0.7, z],
        s: [1, 6 + ((i * 37) % 10) / 4, 1],
        r: i * 1.7,
      })),
      crowns: PALMS.map<Placement>(([x, z], i) => {
        const h = 6 + ((i * 37) % 10) / 4;
        const lean = 0.35;
        const a = i * 1.7;
        return { p: [x + Math.cos(-a) * lean, 0.7 + h, z + Math.sin(-a) * lean], r: a };
      }),
      planters: PLANTERS.map<Placement>(([x, z]) => ({ p: [x, 0, z] })),
      strips: STRIPS.map<Placement>(([x, z0, z1]) => ({ p: [x, 0, (z0 + z1) / 2], s: [1, 1, z1 - z0] })),
      // Trimmed hedge in ~2 m segments (instanced, slightly varied).
      stripHedges: STRIPS.flatMap<Placement>(([x, z0, z1]) => {
        const n = Math.max(1, Math.round((z1 - z0) / 2));
        const seg = (z1 - z0) / n;
        return Array.from({ length: n }, (_, i): Placement => ({
          p: [x, 0.55, z0 + seg * (i + 0.5)],
          s: [1, 0.9 + (i % 3) * 0.08, seg / 2],
          r: i % 2 ? Math.PI : 0,
        }));
      }),
      shrubs: PLANTERS.map<Placement>(([x, z], i) => ({ p: [x, 0.7, z], s: [1.5, 0.8, 0.75], r: (i % 4) * (Math.PI / 2) })),
      poles: DISC_LAMPS.map<Placement>(([x, z]) => ({ p: [x, 0, z], s: [1, 4.6, 1] })),
      discs: DISC_LAMPS.map<Placement>(([x, z]) => ({ p: [x, 4.62, z] })),
      discGlow: DISC_LAMPS.map<Placement>(([x, z]) => ({ p: [x, 4.56, z] })),
      discPools: DISC_LAMPS.map<Placement>(([x, z]) => ({ p: [x, 0.02, z], s: [11, 1, 11] })),
      bollards: BOLLARDS.map<Placement>(([x, z]) => ({ p: [x, 0, z] })),
      bollardHeads: BOLLARDS.map<Placement>(([x, z]) => ({ p: [x, 0.82, z] })),
      bollardPools: BOLLARDS.map<Placement>(([x, z]) => ({ p: [x, 0.018, z], s: [3.2, 1, 3.2] })),
      benchLegs: BENCHES.flatMap<Placement>((b) => {
        const r = b.r ?? 0;
        const dx = Math.cos(r) * 0.8;
        const dz = -Math.sin(r) * 0.8;
        return [
          { p: [b.p[0] + dx, 0, b.p[2] + dz], r },
          { p: [b.p[0] - dx, 0, b.p[2] - dz], r },
        ];
      }),
      benchTops: BENCHES,
      roadPoles: ROAD_LIGHTS.map<Placement>(([x, z]) => ({ p: [x, 0, z] })),
      roadHeads: ROAD_LIGHTS.map<Placement>(([x, z]) => ({ p: [x, 9.05, z] })),
      roadPools: ROAD_LIGHTS.map<Placement>(([x, z]) => ({ p: [x, 0.02, z], s: [16, 1, 16] })),
    };
  }, [trees]);

  const lampWarm = new THREE.Color("#ffc58a").multiplyScalar(2.2);
  const lanternWarm = new THREE.Color("#ffbf78").multiplyScalar(1.9);
  const roadSodium = new THREE.Color("#ffb35c").multiplyScalar(2.4);

  return (
    <group>
      <AcademicBuilding {...BUILDINGS.b70} seed={70} concrete={tex.concrete} />
      <AcademicBuilding {...BUILDINGS.b57} seed={57} concrete={tex.concrete} />

      {/* Tree belt (dense evergreen screen seen in the site photos). */}
      <Instances geometry={geo.trunk} items={items.trunks}>
        <meshStandardMaterial color="#2b231d" roughness={1} />
      </Instances>
      <Instances geometry={geo.canopy} items={items.canopies}>
        <meshStandardMaterial color="#1a251c" roughness={0.95} envMapIntensity={0.4} />
      </Instances>

      <Instances geometry={geo.farCanopy} items={farTrees}>
        <meshStandardMaterial color="#161f19" roughness={1} envMapIntensity={0.3} />
      </Instances>

      {/* Palms in planters. */}
      <Instances geometry={geo.planter} items={items.planters} castShadow>
        <meshStandardMaterial color="#4a4a50" roughness={0.85} />
      </Instances>
      <Instances geometry={geo.strip} items={items.strips}>
        <meshStandardMaterial color="#4a4a50" roughness={0.85} />
      </Instances>
      <Instances geometry={geo.hedge} items={items.stripHedges}>
        <meshStandardMaterial color="#26351f" roughness={0.95} envMapIntensity={0.4} />
      </Instances>
      <Instances geometry={geo.hedge} items={items.shrubs}>
        <meshStandardMaterial color="#2f4128" roughness={0.95} />
      </Instances>
      <Instances geometry={geo.palmTrunk} items={items.palmTrunks} castShadow>
        <meshStandardMaterial color="#5d4c3c" roughness={0.95} />
      </Instances>
      <Instances geometry={geo.crown} items={items.crowns} castShadow>
        <meshStandardMaterial
          map={tex.frond}
          alphaTest={0.45}
          side={THREE.DoubleSide}
          color="#9db07c"
          roughness={0.85}
        />
      </Instances>

      {/* Plaza disc lamps (site photos) with faked light pools. */}
      <Instances geometry={geo.pole} items={items.poles} castShadow>
        <meshStandardMaterial color="#1b1c20" roughness={0.5} metalness={0.6} />
      </Instances>
      <Instances geometry={geo.disc} items={items.discs}>
        <meshStandardMaterial color="#202127" roughness={0.45} metalness={0.6} />
      </Instances>
      <Instances geometry={geo.discGlow} items={items.discGlow}>
        <meshBasicMaterial color={lampWarm} toneMapped={false} side={THREE.DoubleSide} />
      </Instances>
      <Instances geometry={geo.pool} items={items.discPools}>
        <meshBasicMaterial
          map={tex.pool}
          color="#ffb877"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Instances>

      {/* Masterplan lantern bollards. */}
      <Instances geometry={geo.bollard} items={items.bollards}>
        <meshStandardMaterial color="#17181c" roughness={0.6} metalness={0.4} />
      </Instances>
      <Instances geometry={geo.bollardHead} items={items.bollardHeads}>
        <meshBasicMaterial color={lanternWarm} toneMapped={false} />
      </Instances>
      <Instances geometry={geo.pool} items={items.bollardPools}>
        <meshBasicMaterial
          map={tex.pool}
          color="#ffad66"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Instances>

      {/* Stone benches. */}
      <Instances geometry={geo.benchLeg} items={items.benchLegs}>
        <meshStandardMaterial color="#b4a993" roughness={0.9} />
      </Instances>
      <Instances geometry={geo.benchTop} items={items.benchTops}>
        <meshStandardMaterial color="#c0b59f" roughness={0.88} />
      </Instances>

      {/* Distant campus road lighting. */}
      <Instances geometry={geo.roadPole} items={items.roadPoles}>
        <meshStandardMaterial color="#202024" roughness={0.6} />
      </Instances>
      <Instances geometry={geo.roadHead} items={items.roadHeads}>
        <meshBasicMaterial color={roadSodium} toneMapped={false} />
      </Instances>
      <Instances geometry={geo.pool} items={items.roadPools}>
        <meshBasicMaterial
          map={tex.pool}
          color="#ff9f4d"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Instances>

      {/* Entertainment-area passage between Buildings 70 and 57 (masterplan), kept as scenery. */}
      <mesh position={[27, 0.008, -12]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[6, 18]} />
        <meshStandardMaterial color="#6f6f73" roughness={0.9} />
      </mesh>
      <PlazaEdge />
      <EntertainmentGround />
      <PassageSign />
    </group>
  );
}

/** Low stone edge where the paved event zone meets the north buildings' forecourt. */
function PlazaEdge() {
  const b = PLAZA.pavedBounds;
  return (
    <mesh position={[(b.minX + b.maxX) / 2, 0.1, b.minZ - 0.15]}>
      <boxGeometry args={[b.maxX - b.minX, 0.2, 0.3]} />
      <meshStandardMaterial color="#8e877b" roughness={0.9} />
    </mesh>
  );
}

/** Paving for the (provisional) entertainment zone north of the passage. */
function EntertainmentGround() {
  const w = ENTERTAINMENT.maxX - ENTERTAINMENT.minX + 8;
  const d = ENTERTAINMENT.maxZ - ENTERTAINMENT.minZ + 6;
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[(ENTERTAINMENT.minX + ENTERTAINMENT.maxX) / 2, 0.004, (ENTERTAINMENT.minZ + ENTERTAINMENT.maxZ) / 2 + 1]}
      receiveShadow
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#5e5a55" roughness={0.9} />
    </mesh>
  );
}

/** Directional sign at the passage mouth, as drawn on the masterplan. */
function PassageSign() {
  const tex = useAsyncTexture(passageSignTexture);
  return (
    <group position={[PASSAGE.x, 0, PASSAGE.signZ]}>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} castShadow>
          <boxGeometry args={[0.08, 2.2, 0.08]} />
          <meshStandardMaterial color="#1b1c22" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[2.5, 1.1, 0.06]} />
        <meshStandardMaterial color="#141a3a" roughness={0.6} />
      </mesh>
      {tex && (
        <mesh position={[0, 1.75, 0.035]}>
          <planeGeometry args={[2.44, 1.06]} />
          <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.35} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}
