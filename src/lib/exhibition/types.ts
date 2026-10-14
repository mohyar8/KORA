export type Vec3 = readonly [number, number, number];

/** Whether a value comes from a dimensioned drawing or was inferred from images. */
export type Provenance = "measured" | "inferred";

export type CornerId = "corner-1" | "corner-2" | "corner-3" | "corner-4" | "corner-5" | "corner-6";
export type AreaId = "museum" | "stage" | "entertainment" | CornerId;

export type AreaKind = "museum" | "stage" | "entertainment" | "corner";

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
  /** Compact label for in-scene pins. */
  shortName: string;
  eyebrow: string;
  teaser: string;
  highlights: readonly string[];
  /** Copy is placeholder until the product owner approves it. */
  provisional: boolean;
};

export type Box = { center: Vec3; size: Vec3 };

export type AreaConfig = {
  id: AreaId;
  kind: AreaKind;
  content: AreaContent;
  /**
   * "modelled": follows an approved preliminary design.
   * "placeholder": design not yet modelled or not yet confirmed — rendered as
   * a clearly marked translucent massing.
   */
  model: "modelled" | "placeholder";
  /**
   * Local model frame: kit models and replacement GLBs are authored in this
   * frame (metres, +Z = open front / audience side), so swapping a model
   * never touches anchors, hit volumes or content.
   */
  frame: { position: Vec3; rotationY: number; scale?: number };
  /** Optional replacement model (GLB, authored in `frame`); overrides the code kit. */
  modelUrl?: string;
  /** Placement note shown in the card when the position itself is uncertain. */
  placementNote?: string;
  /** Shown in the card when the model is a provisional concept, not a supplied design. */
  designNote?: string;
  anchor: CameraAnchor;
  look: LookBounds;
  /** Model-independent click/hover volumes. */
  hitBoxes: readonly Box[];
  /** Where the in-scene label pin sits. */
  labelAt: Vec3;
  /**
   * World point the information card is pinned to (card centre). Defaults to
   * a point in front of and slightly below the subject (see `cardAnchor`).
   */
  cardAt?: Vec3;
};
