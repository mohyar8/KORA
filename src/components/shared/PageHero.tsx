import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { EVENT } from "@/lib/constants";

export function PageHero({
  id,
  label,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  id: string;
  label: string;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section
      aria-labelledby={id}
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
          <p className="kora-label text-coral">{label}</p>
          <h1
            id={id}
            className="mt-4 max-w-3xl text-balance text-4xl font-extrabold leading-[1.5] sm:text-5xl md:text-6xl"
          >
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-loose text-paper/75 md:text-lg">
            {body}
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-9 flex flex-col items-start gap-4">
          <Button href={ctaHref} variant="primary" showArrow={false}>
            {ctaLabel}
          </Button>
          <p className="text-sm font-medium text-paper/55">
            {EVENT.dates} · {EVENT.venueShort}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
