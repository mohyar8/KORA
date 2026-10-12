import type { Provenance } from "./types";

/**
 * Site coordinates, in metres, derived from the preliminary event masterplan
 * (references/…12.05.50 PM.jpeg). Not surveyed.
 *
 * Origin: north-west corner of the event plaza as drawn on the masterplan
 * (Buildings 70 and 57 along the top edge). +X runs east (towards the
 * museum), +Z runs south (towards the corners zone), +Y is up.
 *
 * Plan pixels → metres: x = (px − 80) / 16.4, z = (py − 185) / 14 on the
 * 1056 × 1516 image. The masterplan's dimension strings disagree on scale
 * (≈16 px/m for the 30 m path vs ≈21 px/m for the 12 m stage), so element
 * *positions* come from the drawing and element *sizes* from the dimension
 * strings where they exist. Every value is tagged.
 */

type Dim = { value: number; source: Provenance };
const m = (value: number, source: Provenance = "inferred"): Dim => ({ value, source });

export const PLAZA = {
  /** Event zone bounds (masterplan frame). */
  width: m(56),
  depth: m(36),
  /** Paved surroundings extend well beyond the event zone (site photos / satellite). */
  pavedBounds: { minX: -14, maxX: 78, minZ: -3, maxZ: 64 },
  entrancePathLength: m(30, "measured"),
  /** Visitor entrance gap in the west planter column. */
  entrance: { x: 0.8, z: 24.2 },
} as const;

/**
 * Museum: a long, dark, closed volume on the east side of the plaza.
 * The masterplan gives no museum dimensions; length/depth are scaled from the
 * plan, height from the door proportions in the exterior render.
 */
export const MUSEUM = {
  /** Plaza-facing (west) facade plane. */
  facadeX: 45.5,
  /** Northern end of the building; facade "u" coordinate runs southward from here. */
  northZ: 4,
  length: m(28).value,
  depth: m(10).value,
  height: m(5.6).value,
  portal: { u0: 2.6, u1: 9.4, openingHeight: 3.6, recess: 2.6 },
  exit: { u0: 22.6, u1: 24.3, height: 2.9, recess: 0.7 },
} as const;

export const BUILDINGS = {
  b70: { minX: -10, maxX: 24, minZ: -24, maxZ: -7, height: m(15).value },
  b57: { minX: 30, maxX: 72, minZ: -25, maxZ: -7, height: m(17).value },
} as const;

/** Main stage: 12.0 × 5.0 m (measured); centre from the plan; height inferred from the stage renders. */
export const STAGE = {
  centerX: 26.6,
  centerZ: 8.1,
  width: m(12, "measured").value,
  depth: m(5, "measured").value,
  deckHeight: m(1.0).value,
  screenHeight: m(5.5).value,
} as const;

/**
 * Audience: two curved seating blocks either side of a 2.0 m aisle
 * (measured). Modelled as annular sectors around a centre north of the stage
 * so that the rows span the plan's z 11.8–21.4 m.
 */
export const SEATING = {
  center: { x: 26.6, z: -4 },
  innerRadius: 16,
  outerRadius: 25.5,
  /** Angles (radians, from +X towards +Z). */
  blocks: [
    { from: (63 * Math.PI) / 180, to: (84 * Math.PI) / 180 },
    { from: (96 * Math.PI) / 180, to: (117 * Math.PI) / 180 },
  ],
  aisle: m(2, "measured").value,
} as const;

/**
 * The seven booth slots of the "Corners / Experience Zones" block. Positions
 * from the plan; the bottom-centre slot is dimensioned 4.0 × 2.5 m with a
 * 1.5 m gap (measured), the other sizes are scaled from the drawing.
 * `facing` is the direction the open front looks towards (into the zone).
 */
export type CornerSlot = { x: number; z: number; w: number; d: number; facing: "east" | "west" | "north" };
export const CORNER_SLOTS: readonly CornerSlot[] = [
  { x: 12.8, z: 27.5, w: 3, d: 3, facing: "east" },
  { x: 12.8, z: 31.2, w: 3, d: 3, facing: "east" },
  // South row set back ≈2.3 m from the plan (owner request, 2026-10-12) so the
  // open fronts of slots 2 and 7 face clear floor instead of booth sides.
  { x: 18.0, z: 34.4, w: 3.4, d: 2, facing: "north" },
  { x: 24.7, z: 34.15, w: 4, d: 2.5, facing: "north" },
  { x: 31.6, z: 34.4, w: 3.4, d: 2, facing: "north" },
  { x: 37.2, z: 27.5, w: 3, d: 3, facing: "west" },
  { x: 37.2, z: 31.2, w: 3, d: 3, facing: "west" },
];

/** The "Gate" element on the plan's west side (design not supplied). */
export const GATE = { minX: 6.1, maxX: 7.6, minZ: 11.4, maxZ: 21.2, height: m(2.6).value } as const;

/** Planter strip between the audience and the museum path (plan), with its palms. */
export const MUSEUM_PATH_PLANTERS = {
  x: 40,
  runs: [
    [3.2, 22.4],
    [25.2, 34],
  ] as const,
  // Plan shows palms at ≈5.7 / 17.5 / 26.4 / 33.6 m. The 17.5 m palm sits at
  // the strip end (22 m) and the 5.7 m palm is omitted: both stood in the
  // museum viewpoint's sightline (F-10).
  palms: [22, 26.4, 33.6] as const,
};

/** West edge planter column with palms (plan), broken by the entrance. */
export const WEST_PLANTERS = { x: 1.5, palms: [1.9, 6.8, 13.9, 20.7, 27.6, 31.8] as const };

/** Palms along the south edge behind the corners (plan). */
export const SOUTH_PALMS = { z: 37.4, xs: [15.2, 19.8, 24.4, 29.6, 34.1, 41.5] as const };

/** "إلى الساحة الترفيهية" sign at the passage mouth between Buildings 70 and 57 (plan). */
export const PASSAGE = { x: 27, signZ: -0.8, minX: 24, maxX: 30 } as const;

/**
 * Entertainment zone. The masterplan only shows an arrow "To Entertainment
 * Area" through the passage; its location and footprint are NOT documented.
 * Placed provisionally just north of the passage.
 */
export const ENTERTAINMENT = { minX: 11, maxX: 43, minZ: -54, maxZ: -32 } as const;
