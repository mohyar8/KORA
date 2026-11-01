import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { HexField } from "@/components/motion/HexField";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SPEAKER_PROFILES } from "@/lib/content";

const ACCENTS = ["var(--color-coral)", "var(--color-fuchsia)", "var(--color-green)"] as const;

export function SpeakerProfiles() {
  return (
    <section
      aria-labelledby="speaker-profiles-heading"
      className="has-hex relative overflow-hidden bg-ink py-16 md:py-24"
    >
      <HexField />
      <Container>
        <h2
          id="speaker-profiles-heading"
          className="text-balance text-3xl font-extrabold leading-[1.5] sm:text-4xl md:text-5xl"
        >
          من نبحث عنه؟
        </h2>

        <Stagger as="ul" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {SPEAKER_PROFILES.map((profile, index) => (
            <StaggerItem
              as="li"
              key={profile}
              className="kora-card flex items-center gap-4 border border-paper/12 bg-navy-dark/85 p-6 backdrop-blur-sm"
              style={{ "--accent": ACCENTS[index % ACCENTS.length] } as CSSProperties}
            >
              <span aria-hidden className="kora-pentagon kora-card-mark size-8 shrink-0" />
              <span className="text-lg font-bold">{profile}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
