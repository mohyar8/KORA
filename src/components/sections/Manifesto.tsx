import { SocialPentagons } from "@/components/ui/SocialIcons";
import { Mark } from "@/components/ui/Mark";
import { Reveal } from "@/components/motion/Reveal";
import { HexField } from "@/components/motion/HexField";
import { SpinningBall } from "@/components/motion/SpinningBall";

const LINES = ["لا تكتفِ", "بمشاهدة اللعبة.", "كن جزءًا مما يصنعها."] as const;

export function Manifesto() {
  return (
    <section aria-labelledby="manifesto-heading" className="manifesto has-hex">
      <HexField />
      <SpinningBall className="manifesto-ball" />
      <div className="manifesto-stage">
        <div className="manifesto-copy">
          <h2 id="manifesto-heading">
            {LINES.map((line, index) => (
              <Reveal
                key={line}
                as="span"
                delay={index * 0.12}
                className={`manifesto-line manifesto-line-${index + 1}`}
              >
                {line}
              </Reveal>
            ))}
          </h2>

          <Reveal delay={0.4}>
            <p className="manifesto-body">
              تابع <Mark>كورة</Mark> واحضر حدثًا جامعيًا يعيد تقديم كرة القدم
              السعودية ك<Mark tone="coral">صناعة</Mark> تجمع الإعلام والتقنية
              وريادة الأعمال والاستثمار والتجربة.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.5} className="manifesto-socials-band">
          <SocialPentagons />
        </Reveal>
      </div>
    </section>
  );
}
