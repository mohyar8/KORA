import type { Provenance } from "./types";

/**
 * Site coordinates, in metres. Not surveyed.
 *
 * Revised layout (owner direction, 2026-10-13): the venue is laid out along
 * one main path running east from the entrance arch. The museum stands to
 * the left (north) of the entrance, the corners form a U to the right
 * (south), the passage to the entertainment zone opens between Buildings 70
 * and 57 just beyond the museum, and the main stage closes the far (east)
 * end of the path, facing the arriving visitors. The ground is roughly
 * 2.5× the area of the masterplan-based layout. Element *sizes* that came
 * from the masterplan's dimension strings (stage 12 × 5 m, 2 m aisle, path
 * width scale) are kept; *positions* are owner-directed and provisional.
 *
 * Origin: the entrance arch. +X runs east along the main path (towards the
 * stage), +Z runs south (towards the corners), +Y is up.
 */

type Dim = { value: number; source: Provenance };
const m = (value: number, source: Provenance = "inferred"): Dim => ({ value, source });

/** Area model frame: kit models / GLBs are authored in it (+Z = open front). */
export type Frame = { position: readonly [number, number, number]; rotationY: number; scale?: number };

/** Local frame point → world (three.js Y rotation, then uniform scale, then translation). */
export function toWorld(frame: Frame, x: number, y: number, z: number): [number, number, number] {
  const s = frame.scale ?? 1;
  const c = Math.cos(frame.rotationY);
  const n = Math.sin(frame.rotationY);
  return [frame.position[0] + s * (x * c + z * n), frame.position[1] + s * y, frame.position[2] + s * (-x * n + z * c)];
}

/** World AABB of a local box [min, max] in a frame. */
export function boxToWorld(frame: Frame, min: readonly [number, number, number], max: readonly [number, number, number]) {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (const x of [min[0], max[0]])
    for (const y of [min[1], max[1]])
      for (const z of [min[2], max[2]]) {
        const p = toWorld(frame, x, y, z);
        for (let i = 0; i < 3; i++) {
          lo[i] = Math.min(lo[i], p[i]);
          hi[i] = Math.max(hi[i], p[i]);
        }
      }
  return { min: lo as [number, number, number], max: hi as [number, number, number] };
}

/** Main visitor path: from outside the arch east to the stage amphitheatre. */
export const MAIN_PATH = { z: 0, halfWidth: m(3).value, fromX: -16, toX: 95.5 } as const;

export const PLAZA = {
  /** Paved surroundings (main path field + building forecourts). */
  pavedBounds: { minX: -16, maxX: 128, minZ: -34.5, maxZ: 54 },
  entrancePathLength: m(30, "measured"),
} as const;

/**
 * Entrance arch «كورة — الصناعة خلف اللعبة» (render …12.05.49 PM (3)).
 * Its plane spans Z (across the main path); visitors walk through along +X.
 */
export const ENTRANCE_ARCH = { x: 0, z: MAIN_PATH.z, rOut: 4.4, rIn: 3.1, depth: 1.4 } as const;

/**
 * Unidentified plan element ("Gate", design not supplied), shown as a ghost
 * massing beside the entrance (same 1.5 × 9.8 m footprint and the same
 * offset from the arch as in the previous layout).
 */
export const GATE = { minX: -10.2, maxX: -8.7, minZ: 3.0, maxZ: 12.8, height: m(2.6).value } as const;

/**
 * Museum: the long, dark, closed volume, now to the left of the entrance
 * with its long facade facing the main path (south). Local model frame as
 * before (facade plane at local x = 0, body towards +x, facade "u" along +z
 * from the portal end), turned so the portal end is the west end — the one
 * nearest the entrance. Dimensions inferred (R-1/R-2).
 */
export const MUSEUM = {
  /** West end of the facade (frame origin). */
  originX: 20,
  /** Plaza-facing (south) facade plane. */
  facadeZ: -16,
  length: m(28).value,
  depth: m(10).value,
  height: m(5.6).value,
  portal: { u0: 2.6, u1: 9.4, openingHeight: 3.6, recess: 2.6 },
  exit: { u0: 22.6, u1: 24.3, height: 2.9, recess: 0.7 },
} as const;
export const MUSEUM_FRAME: Frame = { position: [MUSEUM.originX, 0, MUSEUM.facadeZ], rotationY: Math.PI / 2 };
export const MUSEUM_BOUNDS = {
  minX: MUSEUM.originX,
  maxX: MUSEUM.originX + MUSEUM.length,
  minZ: MUSEUM.facadeZ - MUSEUM.depth,
  maxZ: MUSEUM.facadeZ,
} as const;

/**
 * Buildings 70 and 57 along the north edge (real campus context). Their
 * size is unchanged; they were moved as one block with the passage between
 * them so the passage opens just beyond the museum, not behind it.
 */
const FRONT_Z = -38;
export const BUILDINGS = {
  b70: { minX: 22, maxX: 56, minZ: FRONT_Z - 17, maxZ: FRONT_Z, height: m(15).value },
  b57: { minX: 62, maxX: 104, minZ: FRONT_Z - 18, maxZ: FRONT_Z, height: m(17).value },
} as const;
/** Each building has a 3.5 m forecourt band in front of its facade. */
export const BUILDING_FORECOURT = 3.5;

/**
 * Passage between Buildings 70 and 57 to the entertainment zone. Tunnel,
 * banners, sign and camera route are all placed relative to `frontZ` (the
 * buildings' facade line), exactly as before the move.
 */
export const PASSAGE = { x: 59, minX: 56, maxX: 62, frontZ: FRONT_Z, signZ: FRONT_Z + 6.2 } as const;

/**
 * Entertainment zone (provisional, D-19): just north of the passage, with
 * the same footprint and offset from the passage as before.
 */
export const ENTERTAINMENT = { minX: 43, maxX: 75, minZ: FRONT_Z - 47, maxZ: FRONT_Z - 25 } as const;

/**
 * Main stage: 12.0 × 5.0 m (measured), closing the east end of the main
 * path and facing west, towards the arriving visitors. Height inferred.
 */
export const STAGE = {
  centerX: 110,
  centerZ: MAIN_PATH.z,
  width: m(12, "measured").value,
  depth: m(5, "measured").value,
  deckHeight: m(1.0).value,
  screenHeight: m(5.5).value,
} as const;
/** Stage frame: local +Z (audience side) points west, down the main path. */
export const STAGE_FRAME: Frame = { position: [STAGE.centerX, 0, STAGE.centerZ], rotationY: -Math.PI / 2 };

/**
 * Audience: two curved seating blocks either side of a 2.0 m aisle
 * (measured) — the main path runs into the aisle. Annular sectors around a
 * centre behind the stage, in the STAGE frame (rows 3.9–13.4 m in front of
 * the deck centre). Angles from local +X towards local +Z.
 */
export const SEATING = {
  localCenter: { x: 0, z: -12.1 },
  innerRadius: 16,
  outerRadius: 25.5,
  blocks: [
    { from: (63 * Math.PI) / 180, to: (84 * Math.PI) / 180 },
    { from: (96 * Math.PI) / 180, to: (117 * Math.PI) / 180 },
  ],
  aisle: m(2, "measured").value,
} as const;

/**
 * Corner booths are modelled at their preliminary design size (w × d, from
 * the plan slots) and enlarged uniformly by this factor in their frame, so
 * the designs keep their proportions (the renders read 8–12 m wide, D-20).
 */
export const BOOTH_SCALE = 1.7;

/**
 * Six corner booths in a U open towards the main path: west arm (1, 2)
 * facing east, base (3, 4) facing north, east arm (5, 6) facing west. The
 * U spans ≈47 m along the path — comparable to the entrance-to-museum side.
 * `w × d` is the design size (before BOOTH_SCALE); `facing` is the
 * direction the open front looks towards (into the U).
 */
export type CornerSlot = { x: number; z: number; w: number; d: number; facing: "east" | "west" | "north" };
export const CORNER_SLOTS: readonly CornerSlot[] = [
  { x: 12, z: 16, w: 3, d: 3, facing: "east" },
  { x: 12, z: 28, w: 3, d: 3, facing: "east" },
  { x: 26, z: 39, w: 3.4, d: 2, facing: "north" },
  { x: 40, z: 39, w: 4, d: 2.5, facing: "north" },
  { x: 54, z: 28, w: 3.4, d: 2, facing: "west" },
  { x: 54, z: 16, w: 3.4, d: 2.6, facing: "west" },
];

/** Walkway in front of the booths, around the inside of the U (joins the main path at both arms). */
export const U_WALK = { westX: 18, eastX: 48, baseZ: 35, fromZ: MAIN_PATH.z + 3, halfWidth: 1.5 } as const;

/** Paved walkways (x0, x1, z0, z1): main path, U loop, branch to the passage. */
export const PATHS: readonly (readonly [number, number, number, number])[] = [
  [MAIN_PATH.fromX, MAIN_PATH.toX, -MAIN_PATH.halfWidth, MAIN_PATH.halfWidth],
  [U_WALK.westX - U_WALK.halfWidth, U_WALK.westX + U_WALK.halfWidth, U_WALK.fromZ, U_WALK.baseZ + U_WALK.halfWidth],
  [U_WALK.westX - U_WALK.halfWidth, U_WALK.eastX + U_WALK.halfWidth, U_WALK.baseZ - U_WALK.halfWidth, U_WALK.baseZ + U_WALK.halfWidth],
  [U_WALK.eastX - U_WALK.halfWidth, U_WALK.eastX + U_WALK.halfWidth, U_WALK.fromZ, U_WALK.baseZ + U_WALK.halfWidth],
  [PASSAGE.minX, PASSAGE.maxX, FRONT_Z + BUILDING_FORECOURT, -MAIN_PATH.halfWidth],
];

/**
 * Planter strip between the museum forecourt and the main path, open in
 * front of the portal and the exit, with palms.
 */
export const MUSEUM_PATH_PLANTERS = {
  z: -5.5,
  runs: [
    [18, 21.5],
    [31, 41.5],
    [45.5, 50],
  ] as const,
  palms: [19, 34, 39.5, 48] as const,
};

/** West edge planter column with palms, broken by the entrance arch. */
export const WEST_PLANTERS = { x: 0, gap: 5.4, from: -33, to: 50, palms: [-28, -18, -9, 9, 18, 28, 38, 47] as const };

/** Palms behind the base of the corner U. */
export const SOUTH_PALMS = { z: 46, xs: [10, 19, 33, 47, 57] as const };

/**
 * Event scenery from the preliminary renders (positions inferred, F-15):
 * coffee kiosk and press wall on the entrance forecourt, left of the path;
 * the photo booth at the passage mouth (same offset from the passage as
 * before the move).
 */
export const SCENERY_SPOTS = {
  coffeeKiosk: { x: 7, z: -10.5, rotationY: 0 },
  pressWall: { x: 13.5, z: -11.5, rotationY: 0 },
  /** Queue stanchions along the path edge in front of the press wall. */
  stanchions: { x0: 9, z: -4.6, count: 6, spacing: 1.6 },
  photoBooth: { x: PASSAGE.x + 4.4, z: PASSAGE.frontZ + 5.1, rotationY: -0.5 },
} as const;

/**
 * KORA-branded wayfinding and identity elements for the expanded grounds
 * (owner request, 2026-10-13). Authored here, not from a supplied design:
 * official assets only (lockup, pattern skin), restrained light.
 */
export const VENUE = {
  /** Banner poles [x, z]: pairs along the main path and the passage branch. */
  bannerPoles: [
    ...[8, 33, 42, 68, 80, 90].flatMap((x): [number, number][] => [
      [x, MAIN_PATH.z - MAIN_PATH.halfWidth - 1.3],
      [x, MAIN_PATH.z + MAIN_PATH.halfWidth + 1.3],
    ]),
    ...[-10, -19, -28].flatMap((z): [number, number][] => [
      [PASSAGE.minX - 1.3, z],
      [PASSAGE.maxX + 1.3, z],
    ]),
  ] as readonly (readonly [number, number])[],
  bannerHeight: 6,
  /**
   * Directional totems at the path junctions, facing arriving visitors
   * (west). Each lists destinations with an arrow relative to the reader.
   */
  totems: [
    { x: 6, z: -4.8, rotationY: -Math.PI / 2, rows: ["museum:left", "corners:right", "stage:ahead", "entertainment:ahead"] },
    { x: 22, z: 4.8, rotationY: -Math.PI / 2, rows: ["corners:right", "stage:ahead", "entertainment:ahead"] },
    { x: 53, z: -4.8, rotationY: -Math.PI / 2, rows: ["entertainment:left", "stage:ahead"] },
  ],
  /**
   * Open pentagon canopy (the KORA ball panel) in the corner courtyard,
   * kept inside the band between the booth viewpoints (which ring the
   * courtyard at x ≤ 28, x ≥ 38 and z ≥ 23).
   */
  pentagon: { x: 33, z: 15, radius: 3.8, height: 4.2 },
  /** Lit monolith with the official lockup where the passage branch leaves the main path. */
  monolith: { x: 66, z: -6.5, width: 1.6, height: 4.8, depth: 0.5 },
} as const;

/**
 * Lawns (x0, x1, z0, z1) in the open quarters between the corner U, the
 * passage branch and the amphitheatre, with palms standing in the grass.
 */
export const LAWNS: readonly (readonly [number, number, number, number])[] = [
  [66, 90, 9, 44],
  [67, 90, -30, -10],
  [-13, -3, 15, 44],
];
export const LAWN_PALMS: readonly (readonly [number, number])[] = [
  [70, 16], [79, 27], [87, 38], [72, 38], [86, 15],
  [72, -15], [84, -25], [80, -13],
  [-7, 20], [-8, 35],
];
