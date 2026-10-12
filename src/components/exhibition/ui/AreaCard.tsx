"use client";

import type { RefObject } from "react";
import type { AreaConfig } from "@/lib/exhibition/types";

/**
 * Prominent, centred teaser card shown once the camera arrives. Deliberately
 * has no close/hide control (approved design) — it changes with the selection
 * and disappears only on return to the overview.
 */
export function AreaCard({
  area,
  headingRef,
  reducedMotion,
}: {
  area: AreaConfig;
  headingRef: RefObject<HTMLHeadingElement | null>;
  reducedMotion: boolean;
}) {
  const { content } = area;
  return (
    <article className="exh-card" data-motion={reducedMotion ? "reduced" : "full"} aria-labelledby={`exh-card-${area.id}`}>
      <p className="exh-card-eyebrow">
        <span aria-hidden className="exh-card-rule" />
        {content.eyebrow}
      </p>
      <h3 id={`exh-card-${area.id}`} ref={headingRef} tabIndex={-1} className="exh-card-title">
        {content.name}
      </h3>
      <p className="exh-card-teaser">{content.teaser}</p>
      <ul className="exh-card-tags">
        {content.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      {content.provisional && <p className="exh-card-provisional">نص مبدئي — بانتظار الاعتماد</p>}
    </article>
  );
}
