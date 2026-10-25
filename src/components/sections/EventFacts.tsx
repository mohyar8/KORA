import { CalendarDays, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { EVENT_FACTS } from "@/lib/content";
import { EVENT } from "@/lib/constants";

/** The event in numbers, on a coral band with floating pentagons. */
export function EventFacts() {
  return (
    <section id="facts" aria-labelledby="facts-heading" className="facts-band">
      <span aria-hidden className="facts-shape facts-shape-a kora-pentagon kora-float" />
      <span aria-hidden className="facts-shape facts-shape-b kora-pentagon kora-float" />

      <Container className="relative">
        <Reveal>
          <h2 id="facts-heading" className="text-3xl font-extrabold md:text-5xl">
            حجم الحدث
          </h2>
        </Reveal>

        <Stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-3" gap={0.12}>
          {EVENT_FACTS.map((fact) => (
            <StaggerItem as="li" key={fact.label} className="facts-tile">
              <p className="text-5xl font-extrabold tabular-nums md:text-7xl">
                <AnimatedNumber value={fact.value} />
                {fact.unit}
              </p>
              <p className="mt-2 text-base font-bold text-ink/70">{fact.label}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
          <p className="facts-pill">
            <CalendarDays aria-hidden className="size-5" />
            {EVENT.dates}
          </p>
          <p className="facts-pill">
            <MapPin aria-hidden className="size-5" />
            {EVENT.venueLong}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
