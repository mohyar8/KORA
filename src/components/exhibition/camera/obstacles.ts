import * as THREE from "three";
import { BOOTH_HEIGHT } from "@/lib/exhibition/areas";
import {
  BOOTH_SCALE,
  BUILDING_FORECOURT,
  BUILDINGS,
  CORNER_SLOTS,
  ENTRANCE_ARCH,
  GATE,
  MUSEUM,
  MUSEUM_BOUNDS,
  PASSAGE,
  SCENERY_SPOTS,
  SEATING,
  STAGE,
  STAGE_FRAME,
  VENUE,
  boxToWorld,
} from "@/lib/exhibition/layout";

/** Solid volumes camera flights must not pass through (with a safety margin). */
const MARGIN = 0.8;

function box(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
  return new THREE.Box3(
    new THREE.Vector3(minX - MARGIN, minY, minZ - MARGIN),
    new THREE.Vector3(maxX + MARGIN, maxY + MARGIN, maxZ + MARGIN),
  );
}

/** Box given in the stage frame (local metres). */
function stageBox(min: [number, number, number], max: [number, number, number]) {
  const w = boxToWorld(STAGE_FRAME, min, max);
  return box(w.min[0], w.min[1], w.min[2], w.max[0], w.max[1], w.max[2]);
}

function sectorBounds(from: number, to: number) {
  const xs: number[] = [];
  const zs: number[] = [];
  for (const r of [SEATING.innerRadius, SEATING.outerRadius])
    for (let i = 0; i <= 8; i++) {
      const a = from + ((to - from) * i) / 8;
      xs.push(SEATING.localCenter.x + Math.cos(a) * r);
      zs.push(SEATING.localCenter.z + Math.sin(a) * r);
    }
  // Stone tiers rise to ≈1.7 m at the back row.
  return stageBox([Math.min(...xs), 0, Math.min(...zs)], [Math.max(...xs), 1.9, Math.max(...zs)]);
}

/** Square footprint around a point. */
const around = (x: number, z: number, hx: number, hz: number, h: number) => box(x - hx, 0, z - hz, x + hx, h, z + hz);

const { coffeeKiosk, pressWall, photoBooth } = SCENERY_SPOTS;
const F = PASSAGE.frontZ;

export const OBSTACLES: readonly THREE.Box3[] = [
  ...Object.values(BUILDINGS).map((b) => box(b.minX, 0, b.minZ, b.maxX, b.height + 0.6, b.maxZ + BUILDING_FORECOURT)),
  box(MUSEUM_BOUNDS.minX, 0, MUSEUM_BOUNDS.minZ, MUSEUM_BOUNDS.maxX, MUSEUM.height + 0.2, MUSEUM_BOUNDS.maxZ + 0.3),
  // Stage incl. side stairs, towers (±7.8 m) and roof truss (≈7.5 m), in its frame.
  stageBox([-8.6, 0, -STAGE.depth / 2], [8.6, 7.7, STAGE.depth / 2]),
  ...SEATING.blocks.map((b) => sectorBounds(b.from, b.to)),
  ...CORNER_SLOTS.map((s) => {
    const [sx, sz] = s.facing === "north" ? [s.w, s.d] : [s.d, s.w];
    const S = BOOTH_SCALE;
    return around(s.x, s.z, (sx * S) / 2, (sz * S) / 2, BOOTH_HEIGHT * S);
  }),
  box(GATE.minX, 0, GATE.minZ, GATE.maxX, GATE.height, GATE.maxZ),
  // Scenery: entrance arch, passage tunnel, sign, photo booth, coffee kiosk, press wall.
  // Entrance arch as two legs and a top band, so flights from the overview
  // can pass through its opening (clear corridor |z| < 1.7 m below 2.6 m).
  ...[-1, 1].map((side) =>
    box(
      ENTRANCE_ARCH.x - ENTRANCE_ARCH.depth / 2,
      0,
      ENTRANCE_ARCH.z + (side < 0 ? -ENTRANCE_ARCH.rOut : ENTRANCE_ARCH.rIn - 0.6),
      ENTRANCE_ARCH.x + ENTRANCE_ARCH.depth / 2,
      3,
      ENTRANCE_ARCH.z + (side < 0 ? -(ENTRANCE_ARCH.rIn - 0.6) : ENTRANCE_ARCH.rOut),
    ),
  ),
  box(
    ENTRANCE_ARCH.x - ENTRANCE_ARCH.depth / 2,
    2.6,
    ENTRANCE_ARCH.z - ENTRANCE_ARCH.rOut,
    ENTRANCE_ARCH.x + ENTRANCE_ARCH.depth / 2,
    ENTRANCE_ARCH.rOut,
    ENTRANCE_ARCH.z + ENTRANCE_ARCH.rOut,
  ),
  // Light tunnel as a hollow shell (side frames + roof with the banners), so
  // the entertainment route can fly through its centre (≈2.6 m clear corridor below 4.4 m).
  box(PASSAGE.minX, 0, F - 13.1, PASSAGE.minX + 0.7, 6.6, F + 3.1),
  box(PASSAGE.maxX - 0.7, 0, F - 13.1, PASSAGE.maxX, 6.6, F + 3.1),
  box(PASSAGE.minX, 5.2, F - 13.1, PASSAGE.maxX, 6.6, F + 3.1),
  // Passage sign at the mouth (boards to 2.3 m).
  box(PASSAGE.x - 1.25, 0, PASSAGE.signZ - 0.05, PASSAGE.x + 1.25, 2.3, PASSAGE.signZ + 0.05),
  around(photoBooth.x, photoBooth.z, 0.95, 0.95, 2.3),
  around(coffeeKiosk.x, coffeeKiosk.z, 1.4, 1.4, 2.9),
  around(pressWall.x, pressWall.z, 2.2, 0.25, 2.6),
  // Wayfinding and identity elements.
  ...VENUE.bannerPoles.map(([x, z]) => around(x, z, 0.15, 0.6, VENUE.bannerHeight)),
  ...VENUE.totems.map((t) => around(t.x, t.z, 0.6, 0.6, 2.8)),
  around(VENUE.pentagon.x, VENUE.pentagon.z, VENUE.pentagon.radius, VENUE.pentagon.radius, VENUE.pentagon.height + 0.5),
  around(VENUE.monolith.x, VENUE.monolith.z, VENUE.monolith.width / 2, VENUE.monolith.width / 2, VENUE.monolith.height),
];
