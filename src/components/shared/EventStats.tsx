import { Container } from "@/components/ui/Container";
import { HexField } from "@/components/motion/HexField";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { EVENT_FACTS } from "@/lib/content";

/** KORA in numbers, styled like the home page facts. */
export function EventStats() {
  return (
    <section aria-labelledby="event-stats-heading" className="facts-band has-hex">
      <HexField tone="color" className="hex-field-full" />

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
              <p className="mt-2 text-sm font-bold text-paper/65 md:text-base">{fact.label}</p>
            </StaggerItem>
          ))}
          <StaggerItem as="li" className="facts-tile">
            <p className="text-3xl font-extrabold sm:text-4xl md:text-6xl">KFUPM</p>
            <p className="mt-2 text-sm font-bold text-paper/65 md:text-base">
              جامعة الملك فهد للبترول والمعادن
            </p>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
