import { clsx } from "clsx";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SPONSOR_REASONS } from "@/lib/content";

const ACCENTS = ["bg-coral", "bg-fuchsia", "bg-green"] as const;

export function WhyKora() {
  return (
    <section aria-labelledby="why-kora-heading" className="bg-ink py-16 md:py-24">
      <Container>
        <h2
          id="why-kora-heading"
          className="text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          لماذا كورة؟
        </h2>

        <Stagger as="ul" className="mt-10 grid gap-4 md:grid-cols-2" gap={0.1}>
          {SPONSOR_REASONS.map((reason, index) => (
            <StaggerItem
              as="li"
              key={reason.title}
              className="flex gap-5 border border-paper/15 bg-navy-dark/60 p-6 md:p-8"
            >
              <span
                aria-hidden
                className={clsx(
                  "kora-pentagon mt-1 size-7 shrink-0",
                  ACCENTS[index % ACCENTS.length],
                )}
              />
              <div>
                <h3 className="text-xl font-bold">{reason.title}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-paper/72">
                  {reason.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
