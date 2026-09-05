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
            منصة إعلامية ومعرفية مستدامة، تنقل الجمهور من متابعة كرة القدم بوصفها لعبة إلى فهمها بوصفها صناعة متكاملة، تقف خلفها منظومة واسعة من التاريخ والإعلام والاستثمار والتقنية وريادة الأعمال.
          </p>
          <p>
            ويأتي حدث «كورة» الوطني الجامعي بوصفه المحطة الرئيسية والانطلاقة الأهم للمنصة؛ إذ يأخذ زوّاره في رحلة تبدأ من جذور كرة القدم السعودية وتحولاتها، وتمرّ بكواليس صناعة المحتوى والفرص الاقتصادية والمشاريع الريادية، وصولًا إلى مستقبل القطاع الرياضي وطموحات المملكة نحو 2034. ولا تنتهي رسالة «كورة» بانتهاء أيام الحدث، بل تستمر عبر محتوى إعلامي ومعرفي يواكب تطور الصناعة، ويرفع وعي الشباب بفرصها المهنية والاستثمارية.
          </p>
        </div>
      </div>
    </section>
  );
}
