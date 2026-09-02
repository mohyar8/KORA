import fullLogo from "../../assets/brand/logos/logo 20.svg";
import aboutPattern from "../../assets/brand/patterns/Pattern_2_transparent_HQ.svg";

const tracks = [
  "المتحف التاريخي",
  "الإعلام",
  "الاقتصاد والاستثمار",
  "ريادة الأعمال",
  "الركن الترفيهي",
  "المسرح الرئيسي",
] as const;

export function AboutKora() {
  return (
    <section id="about" className="section about-section" aria-labelledby="about-title">
      <img
        className="about-pattern"
        src={aboutPattern}
        alt=""
        width="720"
        height="720"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <div className="container about-grid">
        <div className="section-heading">
          <p className="eyebrow">عن كورة</p>
          <h2 id="about-title">كرة القدم أبعد من تسعين دقيقة</h2>
          <img
            className="about-logo"
            src={fullLogo}
            alt="KORA — كورة"
            width="420"
            height="118"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="about-content">
          <p className="lead">
            وراء كل مباراة منظومة كاملة من المعرفة والتقنية والإعلام والاستثمار وريادة الأعمال. تأتي كورة لتكشف هذه المنظومة، وتحوّل اهتمام الشباب باللعبة إلى معرفة وتجربة وعمل حقيقي.
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
