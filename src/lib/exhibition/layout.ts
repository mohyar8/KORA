import type { Provenance } from "./types";

/**
 * Site coordinates, in metres, derived from the preliminary event masterplan
 * (references/…12.05.50 PM.jpeg). Not surveyed.
 *
 * Origin: north-west corner of the event plaza as drawn on the masterplan
 * (Buildings 70 and 57 along the top edge). +X runs east (towards the
 * museum), +Z runs south (towards the corners zone), +Y is up.
 *
 * The masterplan's dimension strings disagree on scale (≈16 px/m for the
 * 30 m path vs ≈21 px/m for the 12 m stage); an average was used for
 * undimensioned items, so every value below is tagged.
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
