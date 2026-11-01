import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { HexField } from "@/components/motion/HexField";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SPONSOR_REASONS } from "@/lib/content";

const ACCENTS = ["var(--color-coral)", "var(--color-fuchsia)", "var(--color-green)"] as const;

export function WhyKora() {
  return (
    <section
      aria-labelledby="why-kora-heading"
      className="has-hex relative overflow-hidden bg-ink py-16 md:py-24"
    >
      <HexField />
      <Container>
        <Reveal>
          <h2
            id="why-kora-heading"
            className="text-balance text-3xl font-extrabold leading-[1.5] sm:text-4xl md:text-5xl"
          >
            لماذا كورة؟
          </h2>
        </Reveal>

        <Stagger as="ul" className="mt-10 grid gap-5 md:grid-cols-2" gap={0.1}>
          {SPONSOR_REASONS.map((reason, index) => (
            <StaggerItem
              as="li"
              key={reason.title}
              className="kora-card flex gap-5 border border-paper/12 bg-navy-dark/85 p-6 backdrop-blur-sm md:p-8"
              style={{ "--accent": ACCENTS[index % ACCENTS.length] } as CSSProperties}
            >
              <span aria-hidden className="kora-pentagon kora-card-mark mt-1 size-9 shrink-0" />
              <div>
                <h3 className="text-xl font-extrabold">{reason.title}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-paper/70">{reason.description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
