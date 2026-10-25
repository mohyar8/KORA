import type { Metadata } from "next";
import { PartnersHero } from "@/components/partners/PartnersHero";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: `الشراكات والرعاية | ${BRAND.nameAr}`,
  description:
    "كن شريكًا في كورة: حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يقدّم كرة القدم السعودية بوصفها صناعة. قدّم طلب شراكة وسيتواصل معك فريقنا.",
};

export default function PartnersPage() {
  return (
    <>
      <PartnersHero />
    </>
  );
}
