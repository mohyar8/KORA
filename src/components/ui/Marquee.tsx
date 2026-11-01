import { BRAND, EVENT } from "@/lib/constants";

const ITEMS = [BRAND.taglineAr, EVENT.dates, EVENT.venueShort];

/**
 * Band of the slogan, date and venue drifting left to right, the way Arabic
 * reads into view. Screen readers get the facts once; the moving copies are hidden.
 */
export function Marquee() {
  // Four identical quarters: the -50% → 0 loop always has text on screen.
  const quarter = [...ITEMS, ...ITEMS];
  return (
    <div className="kora-marquee">
      <p className="sr-only">{ITEMS.join(" · ")}</p>
      <div aria-hidden className="kora-marquee-track" dir="ltr">
        {[...quarter, ...quarter].map((text, index) => (
          <span key={index} className="kora-marquee-item" dir="rtl">
            <i />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
