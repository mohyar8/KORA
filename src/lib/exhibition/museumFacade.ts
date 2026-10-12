/**
 * The museum's illuminated polygon linework, in facade coordinates
 * (u = metres along the face from its left end as seen from outside,
 * v = metres above ground).
 *
 * WEST (plaza) face: traced from the exterior render
 * (references/…12.05.47 PM.jpeg) and rectified for perspective — positions
 * are approximate. NORTH face: partly visible in the render (left return).
 * SOUTH and EAST faces are never shown in the reference; their linework is a
 * provisional, deliberately calmer continuation of the same language.
 */

export type FacadeLine = {
  points: readonly (readonly [number, number])[];
  /** Colour at the first and last point; interpolated along the line. */
  colors: readonly [string, string];
  /** Relative brightness (1 = reference strength). */
  intensity?: number;
};

export type FacadeFace = "west" | "north" | "south" | "east";

const MAGENTA = "#ff38c8";
const PINK = "#ff5fa8";
const VIOLET = "#7a4cff";
const BLUE = "#3f66ff";
const CYAN = "#46a6ff";
const ORANGE = "#ff8a3a";
const AMBER = "#ffad55";
const PEACH = "#ffb48a";
const GREEN = "#38f09a";

export const FACADE_LINES: Record<FacadeFace, readonly FacadeLine[]> = {
  west: [
    // Corner panel beside the entrance (u 0 – 2.6).
    { points: [[2.35, 5.6], [1.45, 3.95], [0, 3.3]], colors: [MAGENTA, PINK] },
    // Long facade, left to right.
    { points: [[9.4, 5.6], [10.1, 2.88]], colors: [MAGENTA, VIOLET] },
    { points: [[10.1, 2.88], [9.4, 1.5]], colors: [VIOLET, BLUE] },
    { points: [[10.1, 2.88], [12.14, 2.71]], colors: [VIOLET, ORANGE] },
    { points: [[12.14, 2.71], [13.08, 5.6]], colors: [ORANGE, PEACH], intensity: 0.7 },
    { points: [[12.14, 2.71], [12.83, 0.79]], colors: [ORANGE, PINK] },
    { points: [[12.83, 0.79], [12.66, 0]], colors: [PINK, ORANGE] },
    { points: [[12.83, 0.79], [16.17, 0.12]], colors: [MAGENTA, ORANGE] },
    { points: [[16.17, 0.12], [17.34, 2.78]], colors: [AMBER, MAGENTA] },
    { points: [[17.34, 2.78], [15.8, 5.6]], colors: [MAGENTA, BLUE] },
    { points: [[17.34, 2.78], [17.75, 5.6]], colors: [MAGENTA, VIOLET], intensity: 0.45 },
    { points: [[17.34, 2.78], [20.25, 4.15]], colors: [MAGENTA, PEACH] },
    { points: [[20.25, 4.15], [20.58, 5.6]], colors: [CYAN, BLUE] },
    { points: [[20.25, 4.15], [22.17, 2.1]], colors: [PEACH, ORANGE] },
    { points: [[22.17, 2.1], [22.3, 0]], colors: [ORANGE, AMBER] },
    { points: [[25.95, 5.6], [25.95, 4.37]], colors: [GREEN, GREEN] },
    { points: [[25.95, 4.37], [24.57, 3.57]], colors: [GREEN, CYAN], intensity: 0.8 },
    { points: [[25.95, 4.37], [28, 2.47]], colors: [GREEN, VIOLET], intensity: 0.8 },
  ],
  north: [
    { points: [[10, 3.3], [8.4, 2.0]], colors: [PINK, ORANGE] },
    { points: [[8.4, 2.0], [8.4, 4.9]], colors: [MAGENTA, MAGENTA] },
    { points: [[8.4, 4.9], [7.4, 5.6]], colors: [MAGENTA, VIOLET] },
    { points: [[8.4, 2.0], [6.8, 0]], colors: [PINK, ORANGE] },
    { points: [[8.4, 4.9], [4.6, 3.9]], colors: [VIOLET, BLUE], intensity: 0.6 },
    { points: [[4.6, 3.9], [3.4, 0]], colors: [BLUE, ORANGE], intensity: 0.6 },
    { points: [[4.6, 3.9], [2.2, 5.6]], colors: [BLUE, VIOLET], intensity: 0.5 },
  ],
  south: [
    { points: [[0, 2.47], [2.6, 3.4]], colors: [VIOLET, BLUE], intensity: 0.6 },
    { points: [[2.6, 3.4], [3.4, 5.6]], colors: [BLUE, CYAN], intensity: 0.55 },
    { points: [[2.6, 3.4], [5.9, 1.2]], colors: [BLUE, PINK], intensity: 0.55 },
    { points: [[5.9, 1.2], [6.4, 0]], colors: [PINK, ORANGE], intensity: 0.55 },
    { points: [[5.9, 1.2], [10, 2.2]], colors: [PINK, MAGENTA], intensity: 0.5 },
  ],
  east: [
    { points: [[3, 5.6], [5.5, 2.4]], colors: [VIOLET, PINK], intensity: 0.4 },
    { points: [[5.5, 2.4], [4.8, 0]], colors: [PINK, ORANGE], intensity: 0.4 },
    { points: [[5.5, 2.4], [11, 3.4]], colors: [PINK, BLUE], intensity: 0.35 },
    { points: [[11, 3.4], [12.5, 5.6]], colors: [BLUE, VIOLET], intensity: 0.35 },
    { points: [[11, 3.4], [15.5, 0]], colors: [BLUE, ORANGE], intensity: 0.35 },
    { points: [[15.5, 0], [19, 2.6]], colors: [ORANGE, MAGENTA], intensity: 0.35 },
    { points: [[19, 2.6], [22.5, 5.6]], colors: [MAGENTA, VIOLET], intensity: 0.35 },
    { points: [[19, 2.6], [25, 1.8]], colors: [MAGENTA, PINK], intensity: 0.35 },
  ],
};
