import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { EventStats } from "@/components/shared/EventStats";
import { StepsSection } from "@/components/shared/StepsSection";
import { DirectContact } from "@/components/shared/DirectContact";
import { SpeakerProfiles } from "@/components/speakers/SpeakerProfiles";
import { SpeakerFormats } from "@/components/speakers/SpeakerFormats";
import { SpeakerFormSection } from "@/components/speakers/SpeakerFormSection";
import { BRAND } from "@/lib/constants";
import { SPEAKER_STEPS } from "@/lib/content";

export const metadata: Metadata = {
  title: `المتحدثون | ${BRAND.nameAr}`,
  description:
    "شارك متحدثًا في كورة أو رشّح من تعرفه: حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يقدّم كرة القدم السعودية بوصفها صناعة.",
};

export default function SpeakersPage() {
  return (
    <>
      <PageHero
        id="speakers-heading"
        label="المتحدثون"
        title="شارك صوتك على مسرح كورة"
        body="يستضيف «كورة» قادة الأندية والإعلاميين والمستثمرين والأكاديميين ورواد الأعمال لمناقشة واقع كرة القدم السعودية ومستقبل صناعتها. إن كانت لديك تجربة تستحق أن تُروى، أو تعرف من يستحقها، فنحن نبحث عنك."
        ctaHref="#speaker-request"
        ctaLabel="قدّم أو رشّح متحدثًا"
      />
      <EventStats />
      <SpeakerProfiles />
      <SpeakerFormats />
      <StepsSection id="speaker-steps-heading" title="كيف تتم المشاركة؟" steps={SPEAKER_STEPS} />
      <SpeakerFormSection />
      <DirectContact />
    </>
  );
}
