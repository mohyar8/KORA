import { Sparkles, Eye, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { BENEFITS } from "@/lib/content";

const ICONS = [Sparkles, Eye, Users];

export function WhyJoin() {
  return (
    <section aria-labelledby="why-join-heading" className="why-join-section border-t border-navy/20 py-16 text-ink md:py-24">
      <Container>
        <p className="kora-label text-coral">04 / لماذا تنضم</p>
        <h2
          id="why-join-heading"
          className="mt-3 max-w-2xl text-balance text-3xl font-bold leading-[1.15] sm:text-4xl md:text-5xl"
        >
          تجربة تصنع أثرًا حقيقيًا
        </h2>

        <Stagger
          as="ul"
          className="mt-12 grid border-t border-navy/20 md:grid-cols-3"
          gap={0.12}
        >
          {BENEFITS.map((benefit, index) => {
            const Icon = ICONS[index];
            return (
              <StaggerItem
                as="li"
                key={benefit.title}
                className="relative flex min-h-64 flex-col gap-5 overflow-hidden border-b border-s border-navy/20 p-7 md:p-9"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-widest text-coral">
                    {benefit.number}
                  </span>
                  <span className="kora-pentagon grid size-11 place-items-center bg-white/10 text-coral">
                    <Icon aria-hidden className="size-5 text-coral" />
                  </span>
                </div>
                <h3 className="mt-auto text-xl font-bold">{benefit.title}</h3>
                <p className="text-pretty leading-relaxed text-ink/80">
                  {benefit.description}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
