import {
  BOOTH_SCALE,
  CORNER_SLOTS,
  ENTERTAINMENT,
  MUSEUM,
  MUSEUM_BOUNDS,
  MUSEUM_FRAME,
  PASSAGE,
  STAGE,
  STAGE_FRAME,
  type CornerSlot,
} from "./layout";
import type { AreaConfig, AreaContent, AreaId, CornerId, Vec3 } from "./types";

const museumMidX = (MUSEUM_BOUNDS.minX + MUSEUM_BOUNDS.maxX) / 2;
const museumMidZ = (MUSEUM_BOUNDS.minZ + MUSEUM_BOUNDS.maxZ) / 2;

/**
 * Corner content. Six corners (owner, 2026-10-13): five follow supplied
 * preliminary designs; the sixth, Engineering, has no supplied design and is
 * a clearly marked provisional concept. The position of each corner in the
 * U is PROVISIONAL. Swapping identities only touches this list.
 */
const CORNER_CONTENT: Record<CornerId, AreaContent> = {
  "corner-1": {
    name: "ركن التقنية",
    shortName: "التقنية",
    eyebrow: "منظومة الملعب",
    teaser: "نظرة على التقنيات التي تعمل بصمت خلف كل مباراة، من الملعب الذكي إلى البيانات التي تصنع القرار.",
    highlights: ["الملعب الذكي", "البيانات والتحليل"],
    provisional: true,
  },
  "corner-2": {
    name: "ركن الإعلام",
    shortName: "الإعلام",
    eyebrow: "من الملعب إلى العالم",
    teaser: "كيف تنتقل اللحظة من أرض الملعب إلى ملايين الشاشات؟ رحلة إلى ما خلف البث وصناعة المحتوى الرياضي.",
    highlights: ["خلف البث", "من البث إلى العالم"],
    provisional: true,
  },
  "corner-3": {
    name: "ركن ريادة الأعمال",
    shortName: "ريادة الأعمال",
    eyebrow: "من الفكرة إلى الملعب",
    teaser: "من فرصة صغيرة إلى مشروع رياضي قابل للنمو؛ اكتشف كيف تولد الأفكار في قطاع الرياضة.",
    highlights: ["اكتشف الفرصة", "اتخذ القرار"],
    provisional: true,
  },
  "corner-4": {
    name: "ركن الاقتصاد والاستثمار",
    shortName: "الاقتصاد والاستثمار",
    eyebrow: "القيمة خلف اللعبة",
    teaser: "الوجه الاقتصادي لكرة القدم: الاستثمار والرعاية والقيمة التي تصنعها الملاعب لمدنها.",
    highlights: ["الاستثمار الرياضي", "منظومة الملعب"],
    provisional: true,
  },
  "corner-5": {
    name: "ركن الصحة",
    shortName: "الصحة",
    eyebrow: "الصحة العامة للمجتمع",
    teaser: "كيف تحمي الرياضة صحة المجتمع؟ ركن يقرّب مفاهيم الوقاية والسلامة من الجمهور.",
    highlights: ["الوقاية من الإصابات", "صحة المجتمع"],
    provisional: true,
  },
  "corner-6": {
    name: "ركن الهندسة",
    shortName: "الهندسة",
    eyebrow: "هندسة الملاعب",
    teaser: "من المخطط إلى المدرج: كيف تُصمَّم الملاعب وتُشيَّد لتحمل الجماهير واللعبة معًا؟ نظرة على الهندسة التي تقف خلف كل مباراة.",
    highlights: ["هندسة الإنشاءات", "تصميم الملاعب"],
    provisional: true,
  },
};

export const CORNER_IDS: readonly CornerId[] = [
  "corner-1",
  "corner-2",
  "corner-3",
  "corner-4",
  "corner-5",
  "corner-6",
];
export const BOOTH_HEIGHT = 3;

/**
 * Corners with a code-kit model (Media in M3; Technology, Entrepreneurship,
 * Economy and Health in M4; Engineering as a provisional concept, 2026-10-13).
 */
const MODELLED_CORNERS = new Set<CornerId>(["corner-1", "corner-2", "corner-3", "corner-4", "corner-5", "corner-6"]);

/** Corners whose model is a provisional concept (no supplied design). */
const CONCEPT_CORNERS = new Set<CornerId>(["corner-6"]);

function cornerArea(id: CornerId, slot: CornerSlot, index: number): AreaConfig {
  // Booths are viewed almost head-on, arm booths turned slightly towards the
  // main path (the U's open side).
  const skew = index === 0 || index === 5 ? 0.2 : 0.12;
  const S = BOOTH_SCALE;
  const azimuth = slot.facing === "east" ? -skew : slot.facing === "west" ? Math.PI + skew : -Math.PI / 2;
  const [sx, sz] = slot.facing === "north" ? [slot.w * S, slot.d * S] : [slot.d * S, slot.w * S];
  const rotationY = slot.facing === "east" ? Math.PI / 2 : slot.facing === "west" ? -Math.PI / 2 : Math.PI;
  return {
    id,
    kind: "corner",
    content: CORNER_CONTENT[id],
    model: MODELLED_CORNERS.has(id) ? "modelled" : "placeholder",
    frame: { position: [slot.x, 0, slot.z], rotationY, scale: S },
    placementNote: "توزيع الأركان على المواقع مبدئي",
    designNote: CONCEPT_CORNERS.has(id) ? "تصور مبدئي مقترح — ليس تصميمًا معتمدًا" : undefined,
    anchor: {
      target: [slot.x, 1.75 * S, slot.z],
      azimuth,
      elevation: 0.16,
      distance: 7.8 * S,
      fitWidth: 6 * S,
      maxDistance: 10 * S,
    },
    look: { yaw: 1.0, pitchUp: 0.2, pitchDown: 0.15 },
    hitBoxes: [{ center: [slot.x, (BOOTH_HEIGHT * S) / 2, slot.z], size: [sx + 0.4, BOOTH_HEIGHT * S, sz + 0.4] }],
    labelAt: [slot.x, BOOTH_HEIGHT * S + 0.6, slot.z],
  };
}

const corners = Object.fromEntries(CORNER_IDS.map((id, i) => [id, cornerArea(id, CORNER_SLOTS[i], i)])) as Record<
  CornerId,
  AreaConfig
>;

const entMidX = (ENTERTAINMENT.minX + ENTERTAINMENT.maxX) / 2;
const entMidZ = (ENTERTAINMENT.minZ + ENTERTAINMENT.maxZ) / 2;

export const AREAS: Record<AreaId, AreaConfig> = {
  museum: {
    id: "museum",
    kind: "museum",
    model: "modelled",
    frame: MUSEUM_FRAME,
    content: {
      name: "المتحف",
      shortName: "المتحف",
      eyebrow: "الصناعة خلف اللعبة",
      teaser:
        "مساحة مغلقة تأخذك إلى ما وراء المشهد الذي تعرفه من المدرجات، لتكتشف كيف تتحول كرة القدم السعودية من مباراة إلى صناعة متكاملة.",
      highlights: ["مسار زيارة متكامل", "تجربة بصرية غامرة", "تفاصيل لا تُكتشف إلا في الداخل"],
      provisional: true,
    },
    // Standing on the main path, looking north-east along the facade towards
    // the portal end (nearest the entrance).
    anchor: {
      target: [museumMidX, 1.5, MUSEUM.facadeZ],
      azimuth: Math.atan2(0.85, -0.53),
      elevation: 0.15,
      distance: 19.5,
      fitWidth: 18,
      maxDistance: 21,
    },
    look: { yaw: 0.95, pitchUp: 0.22, pitchDown: 0.12 },
    hitBoxes: [
      {
        center: [museumMidX, MUSEUM.height / 2, museumMidZ],
        size: [MUSEUM.length + 0.4, MUSEUM.height + 0.4, MUSEUM.depth + 0.4],
      },
    ],
    labelAt: [museumMidX, MUSEUM.height + 1.2, museumMidZ],
  },
  stage: {
    id: "stage",
    kind: "stage",
    model: "modelled",
    // Stage + amphitheatre share one frame centred on the stage deck, facing
    // west down the main path.
    frame: STAGE_FRAME,
    content: {
      name: "المسرح والمدرّج",
      shortName: "المسرح",
      eyebrow: "حوارات الصناعة",
      teaser: "منصة الحدث الرئيسية، حيث تلتقي أصوات الصناعة بالجمهور في جلسات تكشف ما يدور خلف القرار الرياضي.",
      highlights: ["جلسات حوارية", "مدرّج مفتوح"],
      provisional: true,
    },
    // From the end of the main path, behind the amphitheatre.
    anchor: {
      target: [STAGE.centerX + 1, 3.4, STAGE.centerZ],
      azimuth: Math.PI,
      elevation: 0.12,
      distance: 20,
      fitWidth: 17,
      maxDistance: 22,
    },
    look: { yaw: 1.0, pitchUp: 0.25, pitchDown: 0.12 },
    hitBoxes: [
      {
        center: [STAGE.centerX, STAGE.screenHeight / 2 + 0.5, STAGE.centerZ],
        size: [STAGE.depth, STAGE.screenHeight + 1, STAGE.width + 1.5],
      },
    ],
    labelAt: [STAGE.centerX + 1.6, STAGE.deckHeight + STAGE.screenHeight + 0.9, STAGE.centerZ],
  },
  entertainment: {
    id: "entertainment",
    kind: "entertainment",
    model: "modelled",
    frame: { position: [entMidX, 0, entMidZ], rotationY: 0 },
    placementNote: "الموقع تقريبي — المخطط يشير إلى الاتجاه فقط",
    content: {
      name: "منطقة الترفيه",
      shortName: "منطقة الترفيه",
      eyebrow: "اختبر مهاراتك",
      teaser: "ساحة مفتوحة للتحدي والمرح، تختبر فيها مهاراتك وتتنافس مع أصدقائك بروح كرة القدم.",
      highlights: ["تحديات مهارية", "ألعاب جماعية"],
      provisional: true,
    },
    // High vantage above the passage, looking down into the zone over the roofs.
    anchor: {
      target: [entMidX, 0, entMidZ - 1],
      azimuth: Math.PI / 2,
      elevation: 0.72,
      distance: 31,
      fitWidth: 34,
      maxDistance: 34,
    },
    look: { yaw: 0.7, pitchUp: 0.2, pitchDown: 0.2 },
    hitBoxes: [
      {
        center: [entMidX, 1.5, entMidZ],
        size: [ENTERTAINMENT.maxX - ENTERTAINMENT.minX, 3, ENTERTAINMENT.maxZ - ENTERTAINMENT.minZ],
      },
      // The wayfinding sign at the passage mouth is the visible entry point from the plaza.
      { center: [PASSAGE.x, 1.4, PASSAGE.signZ], size: [3, 2.8, 0.8] },
    ],
    // Floats above the passage mouth so it reads from the plaza.
    labelAt: [PASSAGE.x, 12, PASSAGE.signZ - 4],
    cardAt: [entMidX, 0.5, ENTERTAINMENT.maxZ - 3],
  },
  ...corners,
};

/** Menu / reading order. */
export const AREA_ORDER: readonly AreaId[] = ["museum", "stage", "entertainment", ...CORNER_IDS];

/**
 * Previous / Next order on the area card: the visitor route from the
 * entrance arch — the museum on the left, the corners around the U on the
 * right (west arm 1–2, base 3–4, east arm 5–6), the stage at the end of the
 * main path, then back through the passage to the entertainment zone. It
 * wraps around at both ends. Free navigation (scene, pins, area list) is
 * independent of it; edit this list to change the tour.
 */
export const TOUR_ORDER: readonly AreaId[] = ["museum", ...CORNER_IDS, "stage", "entertainment"];

export function tourNeighbours(id: AreaId): { prev: AreaId; next: AreaId } {
  const n = TOUR_ORDER.length;
  const i = TOUR_ORDER.indexOf(id);
  return { prev: TOUR_ORDER[(i - 1 + n) % n], next: TOUR_ORDER[(i + 1) % n] };
}

export const AREA_GROUPS: readonly { title: string; ids: readonly AreaId[] }[] = [
  { title: "المعالم الرئيسية", ids: ["museum", "stage", "entertainment"] },
  { title: "الأركان", ids: CORNER_IDS },
];

/** Elevated overview of the whole site. Pulled back automatically on narrow viewports. */
export const OVERVIEW = {
  // From the entrance side, behind the arch on the main-path axis (a little
  // south so the museum facade reads): the gate first, then the whole venue
  // down the path to the stage — museum left, the corner U right.
  position: [-42, 40, 14] as Vec3,
  target: [30, 0, 4] as Vec3,
  /** Width (metres) that must stay in frame at the target distance. */
  fitWidth: 100,
};

export const isCorner = (id: AreaId): id is CornerId => id.startsWith("corner-");

/**
 * World point an area's card is pinned to. Default: on the line from the
 * subject towards its viewpoint, a little below the subject, so in the
 * arrival view the card sits under the subject — and, being in the world,
 * it slides away with the scene when the visitor looks around.
 */
export function cardAnchor(area: AreaConfig): Vec3 {
  if (area.cardAt) return area.cardAt;
  const { target, azimuth, elevation, distance } = area.anchor;
  const t = 0.4;
  const h = Math.cos(elevation) * distance * t;
  return [target[0] + Math.cos(azimuth) * h, Math.max(0.2, target[1] - 1.1), target[2] + Math.sin(azimuth) * h];
}
