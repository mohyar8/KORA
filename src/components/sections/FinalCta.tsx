import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { APPLICATION_DEADLINE, APPLY_URL } from "@/lib/constants";

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="kora-grid relative overflow-hidden border-t border-paper/15 bg-navy py-20 text-white md:py-32"
    >
      <div aria-hidden className="absolute start-1/2 top-1/2 size-[70vw] max-h-[44rem] max-w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/20" />
      <div aria-hidden className="kora-pentagon absolute -end-16 top-20 size-48 bg-coral/60" />

      <Container className="relative flex flex-col items-center text-center">
        <Reveal>
          <h2
            id="final-cta-heading"
            className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.2] sm:text-5xl md:text-7xl"
          >
            مكانك قد يكون خلف اللعبة
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-paper/75">
            تعرّف على الفرق الأقرب إلى مهاراتك واهتماماتك، واستعد لترتيب رغباتك
            الثلاث عند فتح نموذج التقديم.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="mt-10">
          <Magnetic>
            <Button href={APPLY_URL} variant="primary" className="px-9 py-5 text-lg">
              ابدأ طلبك
            </Button>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.18} className="mt-12 w-full max-w-xl">
          <dl className="border border-white/15 bg-navy-dark/80 text-start">
            <div className="flex items-start gap-3 p-6">
              <CalendarClock aria-hidden className="mt-0.5 size-5 shrink-0 text-coral" />
              <div>
                <dt className="text-xs font-semibold tracking-wide text-paper/50">
                  آخر موعد للتقديم
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-paper/85">
                  {APPLICATION_DEADLINE.date}، {APPLICATION_DEADLINE.time}
                </dd>
              </div>
            </div>
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
