import { SocialPentagons } from "@/components/ui/SocialIcons";
import { Mark } from "@/components/ui/Mark";

export function Manifesto() {
  return (
    <section aria-labelledby="manifesto-heading" className="manifesto">
      <div className="manifesto-stage">
        <div className="manifesto-copy">
          <h2 id="manifesto-heading">
            <span className="manifesto-line manifesto-line-1">لا تكتفِ</span>
            <span className="manifesto-line manifesto-line-2">بمشاهدة اللعبة.</span>
            <span className="manifesto-line manifesto-line-3">كن جزءًا مما يصنعها.</span>
          </h2>

          <p className="manifesto-body">
            تابع <Mark>كورة</Mark> واحضر حدثًا جامعيًا يعيد تقديم كرة القدم
            السعودية ك<Mark tone="coral">صناعة</Mark> تجمع الإعلام والتقنية
            وريادة الأعمال والاستثمار والتجربة.
          </p>
        </div>

        <div className="manifesto-socials-band">
          <SocialPentagons />
        </div>
      </div>
    </section>
  );
}
