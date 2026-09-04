import type { CSSProperties } from "react";
import aboutPattern from "../../assets/brand/patterns/Pattern_2_transparent_HQ.svg";

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
          <p className="eyebrow">الصناعة خلف اللعبة</p>
          <h2 id="about-title">عن كورة</h2>
        </div>
        <div className="about-content">
          <p>
            <strong className="about-event-name">«كورة – الصناعة خلف اللعبة»</strong>{" "}
            حدث وطني جامعي ينقل الزائر من متابعة كرة القدم بوصفها لعبة، إلى اكتشافها بوصفها صناعة متكاملة تقف خلفها منظومة من التاريخ والإعلام والاستثمار والتقنية وريادة الأعمال.
          </p>
          <p>
            يأخذ الحدث زوّاره في رحلة تبدأ من جذور كرة القدم السعودية وتحولاتها، وتمرّ بكواليس صناعة المحتوى والفرص الاقتصادية والمشاريع الريادية، وصولًا إلى مستقبل القطاع الرياضي وطموحات المملكة نحو 2034. ومن خلال ستة مسارات تجمع المعرفة بالتجربة والحوار، يسعى «كورة» إلى رفع وعي الشباب بصناعة الرياضة، وتعريفهم بالفرص المهنية والاستثمارية الكامنة خلف كل مباراة.
          </p>
        </div>
      </div>
    </section>
  );
}
