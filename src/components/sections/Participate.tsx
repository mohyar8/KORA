import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { SocialPentagons } from "@/components/ui/SocialIcons";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { PARTICIPATE_PATHS } from "@/lib/content";

const ACCENTS = ["var(--color-coral)", "var(--color-fuchsia)", "var(--color-green)"] as const;

/** One door per audience — sponsor, speaker, visitor — with equal weight. */
export function Participate() {
  return (
    <section
      id="participate"
      aria-labelledby="participate-heading"
      className="section-light kora-grid-light relative scroll-mt-16 py-16 md:py-24"
    >
      <Container>
        <Reveal>
          <p className="kora-label text-coral">شارك معنا</p>
          <h2
            id="participate-heading"
            className="mt-3 max-w-2xl text-balance text-3xl font-extrabold leading-[1.2] sm:text-4xl md:text-5xl"
          >
            شارك في كورة
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink/70">
            كورة تُصنع بمشاركة الجميع. اختر الطريقة الأقرب لك.
          </p>
        </Reveal>

        <Stagger as="ul" className="mt-12 grid gap-5 md:grid-cols-3" gap={0.14}>
          {PARTICIPATE_PATHS.map((path, index) => (
            <StaggerItem
              as="li"
              key={path.number}
              className="kora-card flex flex-col border border-navy/15 bg-white"
              style={{ "--accent": ACCENTS[index % ACCENTS.length] } as CSSProperties}
            >
              <div className="flex h-full flex-col">
                <div className="participate-banner">
                  <span className="text-5xl font-extrabold text-white/90">{path.number}</span>
                  <span aria-hidden className="kora-pentagon kora-card-mark participate-mark" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <h3 className="text-2xl font-extrabold">{path.title}</h3>
                  <p className="text-pretty leading-relaxed text-ink/70">{path.description}</p>
                  <div className="mt-auto pt-4">
                    {path.href && path.cta ? (
                      <Link
                        href={path.href}
                        className="inline-flex items-center gap-2 font-bold text-navy underline-offset-4 hover:underline"
                      >
                        {path.cta}
                        <ArrowLeft aria-hidden className="kora-card-arrow size-4" />
                      </Link>
                    ) : (
                      <SocialPentagons className="final-cta-socials participate-socials socials-light" />
                    )}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
