import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { EVENT } from "@/lib/constants";

export function PartnersHero() {
  return (
    <section
      aria-labelledby="partners-heading"
      className="kora-grid relative overflow-hidden bg-ink pb-16 pt-[118px] md:pb-24 md:pt-[150px]"
    >
      <div
        aria-hidden
        className="absolute -start-24 top-1/2 size-[28rem] -translate-y-1/2 rounded-full border border-paper/15"
      />
      <div
        aria-hidden
        className="kora-pentagon absolute -end-24 top-24 size-40 rotate-12 bg-coral/35 md:-end-20 md:top-auto md:bottom-10 md:size-80 md:bg-coral/70"
      />

      <Container className="relative">
        <Reveal>
          <p className="kora-label text-coral">الشراكات والرعاية</p>
          <h1
            id="partners-heading"
            className="mt-4 max-w-3xl text-balance text-4xl font-extrabold leading-[1.2] sm:text-5xl md:text-6xl"
          >
            علامتك في قلب الصناعة خلف اللعبة
          </h1>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-loose text-paper/75 md:text-lg">
            «كورة» حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يقدّم كرة
            القدم السعودية بوصفها صناعة متكاملة. نبحث عن شركاء يؤمنون بهذه
            الصناعة ويريدون أن يكونوا جزءًا منها.
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-9 flex flex-col items-start gap-4">
          <Button href="#request" variant="primary" showArrow={false}>
            قدّم طلب شراكة
          </Button>
          <p className="text-sm font-medium text-paper/55">
            {EVENT.dates} · {EVENT.venueShort}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
