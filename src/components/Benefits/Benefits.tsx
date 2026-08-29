const benefits = [
  {
    id: "01",
    title: "تجربة حقيقية",
    description: "شارك في تنفيذ مشروع واسع يمتد من الفكرة والتخطيط إلى تجربة الزائر.",
  },
  {
    id: "02",
    title: "أثر يمكنك رؤيته",
    description: "شاهد نتيجة عملك ضمن حدث يصل إلى جمهور جامعي واسع.",
  },
  {
    id: "03",
    title: "فريق متعدد الخبرات",
    description: "اعمل مع طلبة من تخصصات ومهارات مختلفة لبناء تجربة واحدة متكاملة.",
  },
] as const;

export function Benefits() {
  return (
    <section id="benefits" className="section benefits-section" aria-labelledby="benefits-title">
      <div className="container">
        <div className="section-heading section-heading--compact">
          <p className="eyebrow">لماذا تنضم؟</p>
          <h2 id="benefits-title">تجربة تصنع أثرًا حقيقيًا</h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article className="benefit" key={benefit.id}>
              <span aria-hidden="true">{benefit.id}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
