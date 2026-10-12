import { CORNER_SLOTS, ENTERTAINMENT, MUSEUM, PASSAGE, STAGE, type CornerSlot } from "./layout";
import type { AreaConfig, AreaContent, AreaId, CornerId, Vec3 } from "./types";

const museumMidZ = MUSEUM.northZ + MUSEUM.length / 2;

/**
 * Corner content. The masterplan has seven slots but does not say which
 * corner occupies which slot, and only five corner designs were supplied —
 * so the slot ↔ corner mapping below is PROVISIONAL, and two slots are
 * explicitly "to be confirmed". Swapping identities only touches this list.
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
    name: "ركن قيد التأكيد (الموقع ٦)",
    shortName: "ركن ٦",
    eyebrow: "قريبًا",
    teaser: "سيُعلَن عن هذا الركن وتصميمه لاحقًا.",
    highlights: [],
    provisional: true,
  },
  "corner-7": {
    name: "ركن قيد التأكيد (الموقع ٧)",
    shortName: "ركن ٧",
    eyebrow: "قريبًا",
    teaser: "سيُعلَن عن هذا الركن وتصميمه لاحقًا.",
    highlights: [],
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
  "corner-7",
];
export const BOOTH_HEIGHT = 3;

/**
 * Corners with a code-kit model (Media in M3; Technology, Entrepreneurship,
 * Economy and Health in M4). Slots 6–7 stay placeholders until identified.
 */
const MODELLED_CORNERS = new Set<CornerId>(["corner-1", "corner-2", "corner-3", "corner-4", "corner-5"]);

function cornerArea(id: CornerId, slot: CornerSlot, index: number): AreaConfig {
  // Side corners are viewed almost head-on, turned slightly towards the open
  // middle of the zone (the south row was set back to free their fronts).
  const skew = index === 0 || index === 5 ? 0.2 : 0.12;
  const azimuth = slot.facing === "east" ? -skew : slot.facing === "west" ? Math.PI + skew : -Math.PI / 2;
  const [sx, sz] = slot.facing === "north" ? [slot.w, slot.d] : [slot.d, slot.w];
  const rotationY = slot.facing === "east" ? Math.PI / 2 : slot.facing === "west" ? -Math.PI / 2 : Math.PI;
  return {
    id,
    kind: "corner",
    content: CORNER_CONTENT[id],
    model: MODELLED_CORNERS.has(id) ? "modelled" : "placeholder",
    frame: { position: [slot.x, 0, slot.z], rotationY },
    placementNote: "توزيع الأركان على المواقع مبدئي",
    anchor: {
      target: [slot.x, 1.6, slot.z],
      azimuth,
      elevation: 0.16,
      distance: 7.2,
      fitWidth: 6,
      maxDistance: 9.5,
    },
    look: { yaw: 1.0, pitchUp: 0.2, pitchDown: 0.15 },
    hitBoxes: [{ center: [slot.x, BOOTH_HEIGHT / 2, slot.z], size: [sx + 0.3, BOOTH_HEIGHT, sz + 0.3] }],
    labelAt: [slot.x, BOOTH_HEIGHT + 0.5, slot.z],
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
    frame: { position: [MUSEUM.facadeX, 0, MUSEUM.northZ], rotationY: 0 },
    content: {
      name: "المتحف",
      shortName: "المتحف",
      eyebrow: "الصناعة خلف اللعبة",
      teaser:
        "مساحة مغلقة تأخذك إلى ما وراء المشهد الذي تعرفه من المدرجات، لتكتشف كيف تتحول كرة القدم السعودية من مباراة إلى صناعة متكاملة.",
      highlights: ["مسار زيارة متكامل", "تجربة بصرية غامرة", "تفاصيل لا تُكتشف إلا في الداخل"],
      provisional: true,
    },
    // Standing in the open strip north of the stage, looking south-east along
    // the facade (the M1 standpoint is now occupied by the stage).
    anchor: {
      target: [MUSEUM.facadeX, 1.5, museumMidZ],
      // Steeper than M2 so the stage's east truss tower stays out of frame.
      azimuth: Math.atan2(-16, -8),
      elevation: 0.15,
      distance: 19.5,
      fitWidth: 18,
      maxDistance: 21,
    },
    look: { yaw: 0.95, pitchUp: 0.22, pitchDown: 0.12 },
    hitBoxes: [
      {
        center: [MUSEUM.facadeX + MUSEUM.depth / 2, MUSEUM.height / 2, museumMidZ],
        size: [MUSEUM.depth + 0.4, MUSEUM.height + 0.4, MUSEUM.length + 0.4],
      },
    ],
    labelAt: [MUSEUM.facadeX + MUSEUM.depth / 2, MUSEUM.height + 1.2, museumMidZ],
  },
  stage: {
    id: "stage",
    kind: "stage",
    model: "modelled",
    // Stage + amphitheatre share one frame centred on the stage deck.
    frame: { position: [STAGE.centerX, 0, STAGE.centerZ], rotationY: 0 },
    content: {
      name: "المسرح والمدرّج",
      shortName: "المسرح",
      eyebrow: "حوارات الصناعة",
      teaser: "منصة الحدث الرئيسية، حيث تلتقي أصوات الصناعة بالجمهور في جلسات تكشف ما يدور خلف القرار الرياضي.",
      highlights: ["جلسات حوارية", "مدرّج مفتوح"],
      provisional: true,
    },
    anchor: {
      target: [STAGE.centerX, 3.4, STAGE.centerZ - 1],
      azimuth: Math.PI / 2,
      elevation: 0.12,
      distance: 20,
      fitWidth: 17,
      maxDistance: 22,
    },
    look: { yaw: 1.0, pitchUp: 0.25, pitchDown: 0.12 },
    hitBoxes: [
      {
        center: [STAGE.centerX, STAGE.screenHeight / 2 + 0.5, STAGE.centerZ],
        size: [STAGE.width + 1.5, STAGE.screenHeight + 1, STAGE.depth],
      },
    ],
    labelAt: [STAGE.centerX, STAGE.deckHeight + STAGE.screenHeight + 0.9, STAGE.centerZ - 1.6],
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
    // Floats above the passage so it reads over the stage from the plaza.
    labelAt: [PASSAGE.x, 12, PASSAGE.signZ - 4],
    cardAt: [entMidX, 0.5, ENTERTAINMENT.maxZ - 3],
  },
  ...corners,
};

/** Menu / reading order. */
export const AREA_ORDER: readonly AreaId[] = ["museum", "stage", "entertainment", ...CORNER_IDS];

export const AREA_GROUPS: readonly { title: string; ids: readonly AreaId[] }[] = [
  { title: "المعالم الرئيسية", ids: ["museum", "stage", "entertainment"] },
  { title: "الأركان", ids: CORNER_IDS },
];

/** Elevated overview of the whole site. Pulled back automatically on narrow viewports. */
export const OVERVIEW = {
  position: [-4, 30, 66] as Vec3,
  target: [28, 0, 16] as Vec3,
  /** Width (metres) that must stay in frame at the target distance. */
  fitWidth: 58,
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
