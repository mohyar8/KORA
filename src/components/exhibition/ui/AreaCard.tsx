"use client";

import type { RefObject } from "react";
import type { AreaConfig } from "@/lib/exhibition/types";

/**
 * Teaser card for the current area, pinned to a point in the 3D world
 * (positioned every frame by PinProjector), so it stays with its area when
 * the visitor looks around.
 *
 * Expand / collapse (spec v1.2 §3.4): collapsed, it stays at the same world
 * position as a compact bar with the area name and an expand indicator; the
 * whole bar is the toggle. It expands automatically on every new arrival.
 * Accordion pattern: the heading contains the toggle button, which controls
 * the collapsible body (aria-expanded / aria-controls).
 */
export function AreaCard({
  area,
  expanded,
  onToggle,
  toggleRef,
  cardRef,
  reducedMotion,
}: {
  area: AreaConfig;
  expanded: boolean;
  onToggle: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  cardRef?: (el: HTMLElement | null) => void;
  reducedMotion: boolean;
}) {
  const { content } = area;
  const bodyId = `exh-card-body-${area.id}`;
  const notes = [
    area.model === "placeholder" ? "التصميم قيد الإعداد — يظهر هنا نموذج مؤقت" : null,
    area.placementNote ?? null,
    content.provisional ? "نص مبدئي — بانتظار الاعتماد" : null,
  ].filter(Boolean);
  return (
    <article
      ref={cardRef}
      className="exh-card"
      data-expanded={expanded}
      data-motion={reducedMotion ? "reduced" : "full"}
      aria-labelledby={`exh-card-${area.id}`}
    >
      <div className="exh-card-fold" aria-hidden={!expanded}>
        <div>
          <p className="exh-card-eyebrow">
            <span aria-hidden className="exh-card-rule" />
            {content.eyebrow}
          </p>
        </div>
      </div>
      <h3 id={`exh-card-${area.id}`} className="exh-card-title">
        <button
          ref={toggleRef}
          type="button"
          className="exh-card-toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          <span className="exh-card-name">{content.name}</span>
          <span className="exh-card-chevron" aria-hidden />
          <span className="sr-only">{expanded ? "طيّ البطاقة" : "توسيع البطاقة"}</span>
        </button>
      </h3>
      <div id={bodyId} className="exh-card-fold" aria-hidden={!expanded} inert={!expanded}>
        <div>
          <p className="exh-card-teaser">{content.teaser}</p>
          {content.highlights.length > 0 && (
            <ul className="exh-card-tags">
              {content.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          {notes.length > 0 && <p className="exh-card-provisional">{notes.join(" · ")}</p>}
        </div>
      </div>
    </article>
  );
}
