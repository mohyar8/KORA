import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SocialPentagons } from "@/components/ui/SocialIcons";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { PARTICIPATE_PATHS } from "@/lib/content";

const ACCENTS = ["bg-coral", "bg-fuchsia", "bg-green"] as const;

/** One door per audience — sponsor, speaker, visitor — with equal weight. */
export function Participate() {
  return (
    <section
      id="participate"
      aria-labelledby="participate-heading"
      className="kora-grid relative scroll-mt-16 border-t border-paper/15 bg-navy-dark py-16 md:py-24"
    >
      <Container>
        <p className="kora-label text-coral">شارك معنا</p>
        <h2
          id="participate-heading"
          className="mt-3 max-w-2xl text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          شارك في كورة
        </h2>
        <p className="mt-4 max-w-xl text-lg text-paper/70">
          كورة تُصنع بمشاركة الجميع. اختر الطريقة الأقرب لك.
        </p>

        <Stagger
          as="ul"
          className="mt-12 grid border-t border-paper/15 md:grid-cols-3"
          gap={0.12}
        >
          {PARTICIPATE_PATHS.map((path, index) => (
            <StaggerItem
              as="li"
              key={path.number}
              className="flex min-h-72 flex-col gap-4 border-b border-s border-paper/15 bg-ink/40 p-7 md:p-9"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-widest text-paper/60">
                  {path.number}
                </span>
                <span
                  aria-hidden
                  className={clsx("kora-pentagon size-6", ACCENTS[index % ACCENTS.length])}
                />
              </div>
              <h3 className="mt-auto text-2xl font-bold">{path.title}</h3>
              <p className="text-pretty leading-relaxed text-paper/72">{path.description}</p>
              <div className="mt-2">
                {path.href && path.cta ? (
                  <Button href={path.href} variant="secondary" className="px-5 py-3 text-sm">
                    {path.cta}
                  </Button>
                ) : (
                  <SocialPentagons className="final-cta-socials participate-socials" />
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
