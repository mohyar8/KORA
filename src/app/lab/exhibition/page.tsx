import type { Metadata } from "next";
import { ExhibitionSection } from "@/components/exhibition/ExhibitionSection";

/**
 * Temporary, isolated development route for the 3D exhibition (roadmap
 * M1–M4). Not linked, not in the sitemap, not indexed. Filler blocks above
 * and below stand in for the Hero and the following sections so page-scroll
 * behaviour can be tested without touching the homepage.
 */
export const metadata: Metadata = {
  title: "Exhibition lab",
  robots: { index: false, follow: false },
};

export default function ExhibitionLab() {
  return (
    <>
      <div className="grid h-[70svh] place-items-center border-b border-white/10 pt-[70px] text-center text-paper/50">
        <p>مساحة بديلة عن الواجهة الرئيسية — مرّر للأسفل</p>
      </div>
      <ExhibitionSection deferMs={0} />
      <div className="grid h-[120svh] place-items-center text-center text-paper/50">
        <p>بقية أقسام الصفحة</p>
      </div>
    </>
  );
}
