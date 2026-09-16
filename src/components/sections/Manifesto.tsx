import { SOCIAL_NETWORKS } from "@/components/ui/SocialIcons";

function Mark({
  children,
  tone = "green",
}: {
  children: string;
  tone?: "green" | "coral";
}) {
  return (
    <em className={tone === "coral" ? "word-mark word-mark-coral" : "word-mark"}>
      {children}
    </em>
  );
}

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
            انضم إلى فريق <Mark>كورة</Mark>، وشارك في بناء حدث جامعي يعيد تقديم كرة
            القدم السعودية ك<Mark tone="coral">صناعة</Mark> تجمع الإعلام والتقنية
            وريادة الأعمال والاستثمار والتجربة.
          </p>
        </div>

        <div className="manifesto-socials-band">
          <ul className="manifesto-socials" aria-label="حسابات كورة">
            {SOCIAL_NETWORKS.map(({ href, label, Icon, accent }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="manifesto-social"
                  data-accent={accent}
                >
                  <span className="kora-pentagon manifesto-social-ring" aria-hidden />
                  <span className="kora-pentagon manifesto-social-fill" aria-hidden />
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
