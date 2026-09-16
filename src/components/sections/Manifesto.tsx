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
    </section>
  );
}
