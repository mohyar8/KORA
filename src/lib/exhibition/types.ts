export type Vec3 = readonly [number, number, number];

/** Whether a value comes from a dimensioned drawing or was inferred from images. */
export type Provenance = "measured" | "inferred";

export type AreaId = "museum";

/**
 * A viewing anchor: the camera stands `distance` metres from `target`,
 * looking back at it along the given compass angles. `fitWidth` widens the
 * distance on narrow viewports so the subject still fits horizontally.
 */
export type CameraAnchor = {
  target: Vec3;
  /** Horizontal angle (radians) of the camera around the target; 0 = camera on +X. */
  azimuth: number;
  /** Vertical angle (radians) above the horizon. */
  elevation: number;
  distance: number;
  fitWidth: number;
  maxDistance: number;
};

export type LookBounds = {
  /** Max yaw either side of the anchor direction (radians). */
  yaw: number;
  pitchUp: number;
  pitchDown: number;
};

export type AreaContent = {
  name: string;
  eyebrow: string;
  teaser: string;
  highlights: readonly string[];
  /** Copy is placeholder until the product owner approves it. */
  provisional: boolean;
};

export type AreaConfig = {
  id: AreaId;
  content: AreaContent;
  anchor: CameraAnchor;
  look: LookBounds;
  /** Axis-aligned click/hover proxy, independent of the visual model. */
  hitBox: { center: Vec3; size: Vec3 };
};
