import type { CSSProperties } from "react";
import aboutPattern from "../../assets/brand/patterns/Pattern_2_transparent_HQ.svg";
import { BrandName } from "../BrandName/BrandName";

const tracks = [
  "المتحف التاريخي ",
  "الإعلام",
  "الاقتصاد والاستثمار",
  "ريادة الأعمال",
  "الركن الترفيهي ",
  "المسرح الرئيسي",
] as const;

export function AboutKora() {
  const patternStyle = {
    "--about-pattern-image": `url("${aboutPattern}")`,
  } as CSSProperties;

  return (
    <section
      id="about"
      className="section about-section"
      aria-labelledby="about-title"
      style={patternStyle}
    >
      <div className="container about-grid">
        <div className="section-heading">
          <p className="eyebrow">عن <BrandName /></p>
          <h2 id="about-title">كرة القدم أبعد من تسعين دقيقة</h2>
        </div>
        <div className="about-content">
          <p className="lead">
            وراء كل مباراة منظومة كاملة من المعرفة والتقنية والإعلام والاستثمار وريادة الأعمال. تأتي <BrandName /> لتكشف هذه المنظومة، وتحوّل اهتمام الشباب باللعبة إلى معرفة وتجربة وعمل حقيقي.
          </p>
          <ol className="tracks-list" aria-label="مسارات الحدث الستة">
            {tracks.map((track, index) => (
              <li key={track}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {track}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
