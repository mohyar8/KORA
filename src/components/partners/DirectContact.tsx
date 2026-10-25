import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL } from "@/lib/constants";

export function DirectContact() {
  return (
    <section aria-label="تواصل مباشر" className="border-t border-paper/15 bg-ink py-12">
      <Container className="text-center">
        <p className="text-lg text-paper/75">
          تفضّل البريد؟ راسلنا على{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            dir="ltr"
            className="inline-block whitespace-nowrap font-semibold text-coral underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </Container>
    </section>
  );
}
