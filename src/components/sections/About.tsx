import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { AboutArt } from "@/components/sections/AboutArt";

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

const ABOUT_COPY = [
  {
    lead: true,
    node: (
      <>
        «<Mark>كورة</Mark> – الصناعة خلف اللعبة» منصة إعلامية ومعرفية مستدامة،
        تنقل الجمهور من متابعة كرة القدم بوصفها لعبة إلى فهمها بوصفها{" "}
        <Mark tone="coral">صناعة</Mark> متكاملة، تقف خلفها منظومة واسعة من
        التاريخ والإعلام والاستثمار والتقنية وريادة الأعمال والتجربة.
      </>
    ),
  },
  {
    lead: false,
    node: (
      <>
        ويأتي حدث «<Mark>كورة</Mark>» الوطني الجامعي بوصفه المحطة الرئيسية
        والانطلاقة الأهم للمنصة؛ إذ يأخذ زوّاره في رحلة تبدأ من جذور كرة القدم
        السعودية وتحولاتها، وتمرّ بكواليس صناعة المحتوى والفرص الاقتصادية
        والمشاريع الريادية، وصولًا إلى مستقبل القطاع الرياضي وطموحات المملكة نحو
        2034.
      </>
    ),
  },
  {
    lead: false,
    node: (
      <>
        ولا تنتهي رسالة «<Mark>كورة</Mark>» بانتهاء أيام الحدث، بل تستمر عبر
        محتوى إعلامي ومعرفي يواكب تطور الصناعة، ويرفع وعي الشباب بفرصها المهنية
        والاستثمارية.
      </>
    ),
  },
];

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="about-section relative overflow-hidden border-t border-paper/15 bg-navy text-paper"
    >
      <AboutArt />
      <Container className="about-shell px-0 md:px-10">
        <div className="about-copy">
          <Reveal>
            <h2 id="about-heading">
              كرة القدم ليست لعبة فقط، بل{" "}
              <span className="text-coral">صناعة متكاملة.</span>
            </h2>
          </Reveal>
          <div className="about-copy-body">
            {ABOUT_COPY.map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.08}>
                <p data-lead={paragraph.lead ? "true" : undefined}>{paragraph.node}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
