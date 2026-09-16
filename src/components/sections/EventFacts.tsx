import { Container } from "@/components/ui/Container";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { EVENT_FACTS } from "@/lib/content";
import { EVENT } from "@/lib/constants";

export function EventFacts() {
  return (
    <section id="facts" aria-label="أرقام الحدث" className="facts-section">
      <Container>
        <h2 className="facts-heading">حجم الحدث</h2>

        <Stagger as="ul" className="facts-nums">
          {EVENT_FACTS.map((fact) => (
            <StaggerItem
              as="li"
              key={fact.label}
              className="facts-num"
            >
              <p className="text-3xl font-extrabold tabular-nums text-coral sm:text-5xl md:text-7xl">
                <AnimatedNumber value={fact.value} />
                {fact.unit}
              </p>
              <p className="text-xs font-medium text-paper/60 sm:text-sm">
                {fact.label}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="facts-meta">
          <p className="facts-date">{EVENT.dates}.</p>
          <p className="facts-place">
            الظهران، جامعة الملك فهد للبترول والمعادن، ساحة مبنى 57
          </p>
        </div>
      </Container>
    </section>
  );
}
