import { BRAND } from "@/lib/constants";
import { HOME_COPY } from "@/lib/content";

const ITEMS = [BRAND.taglineAr, BRAND.tagline, HOME_COPY.hero.tagline, "9 مسارات", "KFUPM"];

/** Coral band of brand phrases scrolling endlessly; decorative, so hidden from AT. */
export function Marquee() {
  // Two identical halves so the -50% keyframe loops seamlessly.
  const half = [...ITEMS, ...ITEMS];
  return (
    <div aria-hidden className="kora-marquee">
      <div className="kora-marquee-track" dir="ltr">
        {[...half, ...half].map((text, index) => (
          <span key={index} className="kora-marquee-item" dir="auto">
            <i />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
