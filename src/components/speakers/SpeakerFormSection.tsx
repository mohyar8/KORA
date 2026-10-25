import { Container } from "@/components/ui/Container";
import { SpeakerForm } from "@/components/speakers/SpeakerForm";

export function SpeakerFormSection() {
  return (
    <section
      id="speaker-request"
      aria-labelledby="speaker-request-heading"
      className="scroll-mt-20 border-t border-paper/15 bg-navy-dark py-16 md:py-24"
    >
      <Container className="max-w-4xl">
        <h2
          id="speaker-request-heading"
          className="text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          قدّم أو رشّح متحدثًا
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper/70">
          اختر إن كنت تقدّم نفسك أو ترشّح شخصًا تعرفه.
        </p>
        <div className="mt-10">
          <SpeakerForm />
        </div>
      </Container>
    </section>
  );
}
