import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { EventStats } from "@/components/shared/EventStats";
import { WhyKora } from "@/components/partners/WhyKora";
import { Placements } from "@/components/partners/Placements";
import { StepsSection } from "@/components/shared/StepsSection";
import { SponsorFormSection } from "@/components/partners/SponsorFormSection";
import { PartnersLogos } from "@/components/partners/PartnersLogos";
import { DirectContact } from "@/components/shared/DirectContact";
import { BRAND } from "@/lib/constants";
import { PARTNERSHIP_STEPS } from "@/lib/content";

export const metadata: Metadata = {
  title: `الشراكات والرعاية | ${BRAND.nameAr}`,
  description:
    "كن شريكًا في كورة: حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يقدّم كرة القدم السعودية بوصفها صناعة. قدّم طلب شراكة وسيتواصل معك فريقنا.",
};

export default function PartnersPage() {
  return (
    <>
      <PageHero
        id="partners-heading"
        label="الشراكات والرعاية"
        title="علامتك في قلب الصناعة خلف اللعبة"
        body="«كورة» حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يقدّم كرة القدم السعودية بوصفها صناعة متكاملة. نبحث عن شركاء يؤمنون بهذه الصناعة ويريدون أن يكونوا جزءًا منها."
        ctaHref="#request"
        ctaLabel="قدّم طلب شراكة"
      />
      <EventStats />
      <WhyKora />
      <Placements />
      <StepsSection id="steps-heading" title="كيف تتم الشراكة؟" steps={PARTNERSHIP_STEPS} />
      <SponsorFormSection />
      <PartnersLogos />
      <DirectContact />
    </>
  );
}
