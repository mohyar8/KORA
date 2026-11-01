import { Container } from "@/components/ui/Container";
import { SPEAKER_FORMATS } from "@/lib/content";

export function SpeakerFormats() {
  return (
    <section
      aria-labelledby="speaker-formats-heading"
      className="border-t border-paper/15 bg-navy-dark py-16 md:py-24"
    >
      <Container>
        <h2
          id="speaker-formats-heading"
          className="text-balance text-3xl font-bold leading-[1.5] sm:text-4xl md:text-5xl"
        >
          أشكال المشاركة
        </h2>
        <ul className="mt-10 grid border-t border-paper/15 md:grid-cols-2">
          {SPEAKER_FORMATS.map((format) => (
            <li key={format.slug} className="kora-card border-b border-s border-paper/15 p-6 hover:bg-paper/5">
              <p className="font-bold">{format.title}</p>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-paper/70">
                {format.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
