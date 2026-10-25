import { Container } from "@/components/ui/Container";
import type { TitledItem } from "@/lib/content";

export function StepsSection({
  id,
  title,
  steps,
}: {
  id: string;
  title: string;
  steps: readonly TitledItem[];
}) {
  return (
    <section aria-labelledby={id} className="bg-ink py-16 md:py-24">
      <Container>
        <h2
          id={id}
          className="text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          {title}
        </h2>

        <ol className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden
            className="absolute inset-x-[16%] top-6 hidden h-px bg-paper/20 md:block"
          />
          {steps.map((step) => (
            <li key={step.number} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
              <span className="kora-pentagon grid size-12 shrink-0 place-items-center bg-coral text-sm font-bold">
                {step.number}
              </span>
              <div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-paper/72">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
