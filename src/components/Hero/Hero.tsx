import { ApplicationAction } from "../ApplicationAction/ApplicationAction";
import { BrandName } from "../BrandName/BrandName";
import { SocialLinks } from "../SocialLinks/SocialLinks";
import { siteConfig } from "../../config/site";
import heroWordmark from "../../assets/brand/logos/KORA_only.svg";
import heroWatermark from "../../assets/brand/logos/logo_14_transparent_HQ.svg";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <img
        className="hero-watermark"
        src={heroWatermark}
        alt=""
        width="2048"
        height="2048"
        aria-hidden="true"
      />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow eyebrow--light">
            فتح باب الانضمام إلى فريق <BrandName />
          </p>
          <h1 id="hero-title">
            لا تكتفِ بمشاهدة اللعبة.
            <span>كن جزءًا مما يصنعها.</span>
          </h1>
          <p className="hero-intro">
            انضم إلى فريق <BrandName />، وشارك في بناء حدث جامعي يعيد تقديم كرة القدم السعودية كصناعة تجمع الإعلام والتقنية وريادة الأعمال والاستثمار والتجربة.
          </p>
          <div className="hero-actions">
            <ApplicationAction />
            <a className="text-link text-link--light" href="#teams">
              اكتشف فرق العمل
              <span aria-hidden="true">←</span>
            </a>
          </div>
          <div className="application-note">
            <p>
              آخر موعد للتقديم: {" "}
              <time dateTime={siteConfig.applicationDeadlineISO}>
                {siteConfig.applicationDeadlineArabic}
              </time>
            </p>
          </div>
        </div>

        <div className="hero-editorial" aria-label="معلومات الحدث">
          <div className="hero-social-block">
            <p className="hero-social-label">تابعنا</p>
            <SocialLinks className="hero-social-links" location="hero" />
          </div>
          <img
            className="hero-wordmark"
            src={heroWordmark}
            alt="شعار كورة باللغة الإنجليزية"
            width="1001"
            height="248"
          />
          <p>{siteConfig.englishTagline}</p>
          <div className="hero-location">
            <span>{siteConfig.eventDateArabic}</span>
            <span>{siteConfig.eventLocationArabic}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
