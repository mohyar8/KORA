import { ApplicationAction } from "../ApplicationAction/ApplicationAction";
import { siteConfig } from "../../config/site";
import heroPattern from "../../assets/brand/patterns/Pattern_7_transparent_HQ.svg";
import heroAccent from "../../assets/brand/patterns/Pattern_0_transparent_HQ.svg";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <img
        className="hero-pattern"
        src={heroPattern}
        alt=""
        width="760"
        height="760"
        aria-hidden="true"
      />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow eyebrow--light">فتح باب الانضمام إلى فريق KORA</p>
          <h1 id="hero-title">
            لا تكتفِ بمشاهدة اللعبة.
            <span>كن جزءًا مما يصنعها.</span>
          </h1>
          <p className="hero-intro">
            انضم إلى فريق KORA، وشارك في بناء حدث جامعي يعيد تقديم كرة القدم السعودية كصناعة تجمع الإعلام والتقنية وريادة الأعمال والاستثمار والتجربة.
          </p>
          <div className="hero-actions">
            <ApplicationAction />
            <a className="text-link text-link--light" href="#teams">
              اكتشف فرق العمل
              <span aria-hidden="true">←</span>
            </a>
          </div>
          <div className="application-note">
            <p>سيتم التقديم عبر نموذج Microsoft الرسمي باستخدام الحساب الجامعي.</p>
            <p>
              آخر موعد للتقديم: {" "}
              <time dateTime={siteConfig.applicationDeadlineISO}>
                {siteConfig.applicationDeadlineArabic}
              </time>
            </p>
          </div>
        </div>

        <div className="hero-editorial" aria-label="معلومات الحدث">
          <img
            className="hero-accent"
            src={heroAccent}
            alt=""
            width="104"
            height="104"
            aria-hidden="true"
          />
          <span className="hero-index">26</span>
          <p>{siteConfig.englishTagline}</p>
          <strong>{siteConfig.eventName}</strong>
          <div className="hero-location">
            <span>{siteConfig.eventDateArabic}</span>
            <span>{siteConfig.eventLocationArabic}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
