import { Container } from "@/components/ui/Container";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { EVENT_FACTS } from "@/lib/content";

export function EventStats() {
  return (
    <section
      aria-labelledby="event-stats-heading"
      className="border-t border-paper/15 bg-navy-dark py-14 md:py-20"
    >
      <Container className="text-center">
        <h2 id="event-stats-heading" className="facts-heading">
          كورة بالأرقام
        </h2>

        <Stagger as="ul" className="mt-10 grid grid-cols-2 gap-px bg-paper/15 md:grid-cols-4">
          {EVENT_FACTS.map((fact) => (
            <StaggerItem
              as="li"
              key={fact.label}
              className="flex flex-col items-center gap-2 bg-navy-dark px-4 py-8 text-center"
            >
              <p className="text-4xl font-extrabold tabular-nums text-coral md:text-6xl">
                <AnimatedNumber value={fact.value} />
                {fact.unit}
              </p>
              <p className="text-sm font-medium text-paper/65">{fact.label}</p>
            </StaggerItem>
          ))}
          <StaggerItem
            as="li"
            className="flex flex-col items-center gap-2 bg-navy-dark px-4 py-8 text-center"
          >
            <p className="text-4xl font-extrabold text-coral md:text-6xl">KFUPM</p>
            <p className="text-sm font-medium text-paper/65">
              جامعة الملك فهد للبترول والمعادن
            </p>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
