import { MUSEUM } from "./layout";
import type { AreaConfig, AreaId, Vec3 } from "./types";

const museumMidZ = MUSEUM.northZ + MUSEUM.length / 2;

export const AREAS: Record<AreaId, AreaConfig> = {
  museum: {
    id: "museum",
    content: {
      name: "المتحف",
      eyebrow: "الصناعة خلف اللعبة",
      teaser:
        "مساحة مغلقة تأخذك إلى ما وراء المشهد الذي تعرفه من المدرجات، لتكتشف كيف تتحول كرة القدم السعودية من مباراة إلى صناعة متكاملة.",
      highlights: ["مسار زيارة متكامل", "تجربة بصرية غامرة", "تفاصيل لا تُكتشف إلا في الداخل"],
      provisional: true,
    },
    anchor: {
      target: [MUSEUM.facadeX, 1.1, museumMidZ - 1],
      azimuth: Math.PI + 0.74,
      elevation: 0.075,
      distance: 22,
      fitWidth: 25,
      maxDistance: 30,
    },
    look: { yaw: 0.95, pitchUp: 0.22, pitchDown: 0.12 },
    hitBox: {
      center: [MUSEUM.facadeX + MUSEUM.depth / 2, MUSEUM.height / 2, museumMidZ],
      size: [MUSEUM.depth + 0.4, MUSEUM.height + 0.4, MUSEUM.length + 0.4],
    },
  },
};

export const AREA_ORDER: readonly AreaId[] = ["museum"];

/** Elevated overview of the whole site. Pulled back automatically on narrow viewports. */
export const OVERVIEW = {
  position: [12, 21, 60] as Vec3,
  target: [42, 2, 17] as Vec3,
  /** Width (metres) that must stay in frame at the target distance. */
  fitWidth: 60,
};
