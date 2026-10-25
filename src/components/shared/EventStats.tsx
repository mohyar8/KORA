import { Container } from "@/components/ui/Container";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { EVENT_FACTS } from "@/lib/content";

/** KORA in numbers, on the same coral band as the home page facts. */
export function EventStats() {
  return (
    <section aria-labelledby="event-stats-heading" className="facts-band">
      <span aria-hidden className="facts-shape facts-shape-a kora-pentagon kora-float" />
      <span aria-hidden className="facts-shape facts-shape-b kora-pentagon kora-float" />

      <Container className="relative">
        <Reveal>
          <h2 id="event-stats-heading" className="text-3xl font-extrabold md:text-5xl">
            كورة بالأرقام
          </h2>
        </Reveal>

        <Stagger as="ul" className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4" gap={0.1}>
          {EVENT_FACTS.map((fact) => (
            <StaggerItem as="li" key={fact.label} className="facts-tile">
              <p className="text-4xl font-extrabold tabular-nums md:text-6xl">
                <AnimatedNumber value={fact.value} />
                {fact.unit}
              </p>
              <p className="mt-2 text-sm font-bold text-ink/70 md:text-base">{fact.label}</p>
            </StaggerItem>
          ))}
          <StaggerItem as="li" className="facts-tile">
            <p className="text-3xl font-extrabold sm:text-4xl md:text-6xl">KFUPM</p>
            <p className="mt-2 text-sm font-bold text-ink/70 md:text-base">
              جامعة الملك فهد للبترول والمعادن
            </p>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
