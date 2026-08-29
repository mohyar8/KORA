import { siteConfig } from "../../config/site";
import factsPattern from "../../assets/brand/patterns/Pattern_6_transparent_HQ.svg";

const facts = [
  { value: "3", label: "أيام" },
  { value: "6", label: "مسارات" },
  { value: "+20,000", label: "زائر متوقع" },
] as const;

export function EventFacts() {
  return (
    <section className="facts-section" aria-label="أرقام KORA الأساسية">
      <div className="container facts-grid">
        {facts.map((fact) => (
          <div className="fact" key={fact.label}>
            <strong dir="ltr">{fact.value}</strong>
            <span>{fact.label}</span>
          </div>
        ))}
        <div className="fact fact--date">
          <time dateTime="2026-11-12">{siteConfig.eventDateArabic}</time>
          <span>في الظهران</span>
        </div>
      </div>
      <img
        className="facts-pattern"
        src={factsPattern}
        alt=""
        width="1440"
        height="88"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
    </section>
  );
}
