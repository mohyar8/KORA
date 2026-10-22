"use client";

import type { RefObject } from "react";
import { AREAS, tourNeighbours } from "@/lib/exhibition/areas";
import type { AreaConfig, AreaId } from "@/lib/exhibition/types";

export type CardNav = "prev" | "next" | "overview";

/**
 * Compact card for the current area, pinned to a point in the 3D world
 * (positioned every frame by PinProjector), so it stays with its area when
 * the visitor looks around. It carries only the area name, one short
 * question and the navigation (spec v1.6 §3.4); longer descriptions and
 * provisional-content notes live in the text area list below the stage.
 *
 * Expand / collapse (spec v1.2 §3.4): collapsed, it stays at the same world
 * position as a compact bar with the area name and an expand indicator; the
 * whole bar is the toggle. It expands automatically on every new arrival.
 * Accordion pattern: the heading contains the toggle button, which controls
 * the collapsible body (aria-expanded / aria-controls).
 *
 * Below the body, Previous / Back to overview / Next (TOUR_ORDER, linear —
 * no Previous on the first stop, no Next on the entertainment zone) stay
 * visible and focusable in both states, so the sequence also works collapsed.
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
  return (
    <article
      ref={cardRef}
      className="exh-card"
      data-expanded={expanded}
      data-motion={reducedMotion ? "reduced" : "full"}
      aria-labelledby={`exh-card-${area.id}`}
    >
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
          <p className="exh-card-question">{content.question}</p>
        </div>
      </div>
      <nav className="exh-card-nav" aria-label="التنقّل بين المناطق">
        {prev && (
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
        )}
        <button type="button" className="exh-card-nav-btn" data-nav="overview" onClick={() => onNavigate(null, "overview")}>
          المنظر العام
        </button>
        {next && (
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
        )}
      </nav>
    </article>
  );
}
