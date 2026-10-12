import * as THREE from "three";
import { BOOTH_HEIGHT } from "@/lib/exhibition/areas";
import { BUILDINGS, CORNER_SLOTS, GATE, MUSEUM, SEATING, STAGE } from "@/lib/exhibition/layout";

/** Solid volumes camera flights must not pass through (with a safety margin). */
const MARGIN = 0.8;

function box(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
  return new THREE.Box3(
    new THREE.Vector3(minX - MARGIN, minY, minZ - MARGIN),
    new THREE.Vector3(maxX + MARGIN, maxY + MARGIN, maxZ + MARGIN),
  );
}

function sectorBounds(from: number, to: number) {
  const pts: [number, number][] = [];
  for (const r of [SEATING.innerRadius, SEATING.outerRadius])
    for (let i = 0; i <= 8; i++) {
      const a = from + ((to - from) * i) / 8;
      pts.push([SEATING.center.x + Math.cos(a) * r, SEATING.center.z + Math.sin(a) * r]);
    }
  const xs = pts.map((p) => p[0]);
  const zs = pts.map((p) => p[1]);
  // Stone tiers rise to ≈1.7 m at the back row.
  return box(Math.min(...xs), 0, Math.min(...zs), Math.max(...xs), 1.9, Math.max(...zs));
}

export const OBSTACLES: readonly THREE.Box3[] = [
  ...Object.values(BUILDINGS).map((b) => box(b.minX, 0, b.minZ, b.maxX, b.height + 0.6, b.maxZ + 3.5)),
  box(MUSEUM.facadeX - 0.3, 0, MUSEUM.northZ, MUSEUM.facadeX + MUSEUM.depth, MUSEUM.height + 0.2, MUSEUM.northZ + MUSEUM.length),
  // Stage incl. side stairs, towers (±7.8 m) and roof truss (≈7.5 m).
  box(STAGE.centerX - 8.6, 0, STAGE.centerZ - STAGE.depth / 2, STAGE.centerX + 8.6, 7.7, STAGE.centerZ + STAGE.depth / 2),
  ...SEATING.blocks.map((b) => sectorBounds(b.from, b.to)),
  ...CORNER_SLOTS.map((s) => {
    const [sx, sz] = s.facing === "north" ? [s.w, s.d] : [s.d, s.w];
    return box(s.x - sx / 2, 0, s.z - sz / 2, s.x + sx / 2, BOOTH_HEIGHT, s.z + sz / 2);
  }),
  box(GATE.minX, 0, GATE.minZ, GATE.maxX, GATE.height, GATE.maxZ),
];
