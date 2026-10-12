"use client";

import type { RefObject } from "react";
import { AREAS, tourNeighbours } from "@/lib/exhibition/areas";
import type { AreaConfig, AreaId } from "@/lib/exhibition/types";

export type CardNav = "prev" | "next" | "overview";

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
 *
 * Below the body, Previous / Back to overview / Next (TOUR_ORDER) stay
 * visible and focusable in both states, so the tour also works collapsed.
 */
export function AreaCard({
  area,
  expanded,
  onToggle,
  toggleRef,
  cardRef,
  reducedMotion,
  onNavigate,
}: {
  area: AreaConfig;
  expanded: boolean;
  onToggle: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  cardRef?: (el: HTMLElement | null) => void;
  reducedMotion: boolean;
  onNavigate: (id: AreaId | null, control: CardNav) => void;
}) {
  const { prev, next } = tourNeighbours(area.id);
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
      <nav className="exh-card-nav" aria-label="التنقّل بين المناطق">
        <button
          type="button"
          className="exh-card-nav-btn"
          data-nav="prev"
          aria-label={`السابق: ${AREAS[prev].content.name}`}
          title={AREAS[prev].content.name}
          onClick={() => onNavigate(prev, "prev")}
        >
          <span aria-hidden>→</span> السابق
        </button>
        <button type="button" className="exh-card-nav-btn" data-nav="overview" onClick={() => onNavigate(null, "overview")}>
          المنظر العام
        </button>
        <button
          type="button"
          className="exh-card-nav-btn"
          data-nav="next"
          aria-label={`التالي: ${AREAS[next].content.name}`}
          title={AREAS[next].content.name}
          onClick={() => onNavigate(next, "next")}
        >
          التالي <span aria-hidden>←</span>
        </button>
      </nav>
    </article>
  );
}
