import { BRAND, EVENT } from "@/lib/constants";

const ITEMS = [BRAND.taglineAr, BRAND.tagline, EVENT.dates, "9 مسارات", "KFUPM"];

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
