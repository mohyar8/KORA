import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SpinningBall } from "@/components/motion/SpinningBall";
import { Magnetic } from "@/components/motion/Magnetic";
import { SocialPentagons } from "@/components/ui/SocialIcons";

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="kora-grid relative overflow-hidden border-t border-paper/15 bg-navy py-20 text-white md:py-32"
    >
      <div aria-hidden className="absolute start-1/2 top-1/2 size-[70vw] max-h-[44rem] max-w-[44rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-paper/25 [animation-duration:60s]" />
      <div aria-hidden className="kora-pentagon kora-float absolute -end-16 top-20 size-48 bg-coral/60" />
      <div
        aria-hidden
        className="kora-pentagon kora-float absolute -start-10 bottom-16 size-32 bg-fuchsia/55 [animation-delay:-2.5s]"
      />
      <div
        aria-hidden
        className="kora-pentagon kora-float absolute start-[18%] top-12 hidden size-14 bg-green/70 [animation-delay:-4s] md:block"
      />

      <SpinningBall className="final-cta-ball" />
      <Container className="relative flex flex-col items-center text-center">
        <Reveal>
          <h2
            id="final-cta-heading"
            className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.2] sm:text-5xl md:text-7xl"
          >
            كن جزءًا من كورة
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-paper/75">
            تابع كورة لتعرف كل جديد عن الحدث، أو شارك معنا راعيًا أو متحدثًا.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="mt-10">
          <Magnetic>
            <Button href="/#participate" variant="primary" className="px-9 py-5 text-lg">
              شارك معنا
            </Button>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.18} className="mt-12 flex flex-col items-center gap-5">
          <p className="kora-label text-paper/60">تابع كورة</p>
          <SocialPentagons className="final-cta-socials" />
        </Reveal>
      </Container>
    </section>
  );
}
