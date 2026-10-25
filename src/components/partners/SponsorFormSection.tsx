import { Container } from "@/components/ui/Container";
import { SponsorForm } from "@/components/partners/SponsorForm";

export function SponsorFormSection() {
  return (
    <section
      id="request"
      aria-labelledby="request-heading"
      className="scroll-mt-20 border-t border-paper/15 bg-navy-dark py-16 md:py-24"
    >
      <Container className="max-w-4xl">
        <h2
          id="request-heading"
          className="text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          قدّم طلب شراكة
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper/70">
          اسم الشركة والبريد يكفيان، وبقية الحقول تساعدنا على تجهيز عرض يناسبكم.
        </p>
        <div className="mt-10">
          <SponsorForm />
        </div>
      </Container>
    </section>
  );
}
