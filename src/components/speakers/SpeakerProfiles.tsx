import { clsx } from "clsx";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SPEAKER_PROFILES } from "@/lib/content";

const ACCENTS = ["bg-coral", "bg-fuchsia", "bg-green"] as const;

export function SpeakerProfiles() {
  return (
    <section aria-labelledby="speaker-profiles-heading" className="bg-ink py-16 md:py-24">
      <Container>
        <h2
          id="speaker-profiles-heading"
          className="text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          من نبحث عنه؟
        </h2>

        <Stagger as="ul" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {SPEAKER_PROFILES.map((profile, index) => (
            <StaggerItem
              as="li"
              key={profile}
              className="flex items-center gap-4 border border-paper/15 bg-navy-dark/60 p-6"
            >
              <span
                aria-hidden
                className={clsx("kora-pentagon size-7 shrink-0", ACCENTS[index % ACCENTS.length])}
              />
              <span className="text-lg font-bold">{profile}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
