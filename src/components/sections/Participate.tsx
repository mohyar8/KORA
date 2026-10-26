import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { HexField } from "@/components/motion/HexField";
import { FollowButton } from "@/components/sections/FollowButton";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { HOME_COPY, PARTICIPATE_PATHS } from "@/lib/content";

const ACCENTS = ["var(--color-coral)", "var(--color-fuchsia)", "var(--color-green)"] as const;

/** One door per audience — sponsors, speakers, visitors — with equal weight. */
export function Participate() {
  return (
    <section
      id="participate"
      aria-labelledby="participate-heading"
      className="has-hex relative scroll-mt-16 overflow-hidden bg-ink py-16 md:py-24"
    >
      <HexField />
      <Container>
        <Reveal>
          <p className="kora-label text-coral">{HOME_COPY.participate.label}</p>
          <h2
            id="participate-heading"
            className="mt-3 max-w-2xl text-balance text-3xl font-extrabold leading-[1.2] sm:text-4xl md:text-5xl"
          >
            {HOME_COPY.participate.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/70 md:text-lg">
            {HOME_COPY.participate.description}
          </p>
        </Reveal>

        <Stagger as="ul" className="mt-12 grid gap-5 md:grid-cols-3" gap={0.14}>
          {PARTICIPATE_PATHS.map((path, index) => (
            <StaggerItem
              as="li"
              key={path.number}
              className="kora-card flex flex-col border border-paper/12 bg-navy-dark/85 backdrop-blur-sm"
              style={{ "--accent": ACCENTS[index % ACCENTS.length] } as CSSProperties}
            >
              <div className="flex h-full flex-col">
                <div className="participate-banner">
                  <span className="text-3xl font-extrabold text-white/90 md:text-4xl">{path.number}</span>
                  <span aria-hidden className="kora-pentagon kora-card-mark participate-mark" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <h3 className="text-2xl font-extrabold">{path.title}</h3>
                  <p className="text-pretty leading-relaxed text-paper/70">{path.description}</p>
                  <div className="mt-auto pt-4">
                    {path.href ? (
                      <Link
                        href={path.href}
                        className="inline-flex items-center gap-2 font-bold text-paper underline-offset-4 hover:text-coral hover:underline"
                      >
                        {path.cta}
                        <ArrowLeft aria-hidden className="kora-card-arrow size-4" />
                      </Link>
                    ) : (
                      <FollowButton label={path.cta} />
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
