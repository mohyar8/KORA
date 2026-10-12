import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AREA_ORDER, AREAS } from "@/lib/exhibition/areas";
import { ExhibitionLoader } from "./ExhibitionLoader";
import "./exhibition.css";

/**
 * Server-rendered shell for the 3D exhibition. The stage reserves its final
 * height up front (no layout shift for the sections and scroll triggers
 * below), and the textual area list is always in the document — read by
 * screen readers, and shown visually whenever 3D is unavailable.
 */
export function ExhibitionSection({ deferMs }: { deferMs?: number }) {
  return (
    <section id="exhibition" aria-labelledby="exhibition-heading" className="exh">
      <Container>
        <SectionHeading
          onDarkBackground
          headingId="exhibition-heading"
          eyebrow="جولة في موقع الحدث"
          heading="تجوّل في معرض كورة قبل أن تزوره"
          description="استكشف المتحف ومناطق الحدث في تصوّر ثلاثي الأبعاد، ثم تعال لتعيش التجربة كاملة."
        />
      </Container>

      <div className="exh-stage">
        <ExhibitionLoader deferMs={deferMs} />
      </div>

      <Container>
        <div className="exh-list">
          <h3>مناطق المعرض</h3>
          <ul>
            {AREA_ORDER.map((id) => (
              <li key={id}>
                <strong>{AREAS[id].content.name}</strong>
                <p>{AREAS[id].content.teaser}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
