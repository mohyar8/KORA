import { ApplicationAction } from "../ApplicationAction/ApplicationAction";
import { BrandText } from "../BrandName/BrandName";
import { siteConfig } from "../../config/site";
import ctaPattern from "../../assets/brand/patterns/Pattern_8_transparent_HQ.svg";

const statusMessages = {
  open: "نموذج التقديم متاح الآن باستخدام الحساب الجامعي.",
  closed: "انتهت فترة استقبال طلبات الانضمام إلى فرق كورة.",
  "coming-soon": "سيتم فتح نموذج التقديم خلال الفترة المعلنة.",
} as const;

export function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <img
        className="final-cta-pattern"
        src={ctaPattern}
        alt=""
        width="23066"
        height="4595"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <div className="container final-cta-grid">
        <div>
          <p className="eyebrow eyebrow--light">خطوتك التالية</p>
          <h2 id="final-cta-title">مكانك قد يكون خلف اللعبة</h2>
        </div>
        <div className="final-cta-copy">
          <p>تعرّف على الفرق الأقرب إلى مهاراتك واهتماماتك، واستعد لترتيب رغباتك الثلاث عند فتح نموذج التقديم.</p>
          <ApplicationAction />
          <p className="status-message" role="status">
            <BrandText>{statusMessages[siteConfig.applicationStatus]}</BrandText>
          </p>
          <p className="deadline">
            آخر موعد للتقديم: {" "}
            <time dateTime={siteConfig.applicationDeadlineISO}>{siteConfig.applicationDeadlineArabic}</time>
          </p>
        </div>
      </div>
    </section>
  );
}
