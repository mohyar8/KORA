"use client";

import { useEffect, useRef, type RefObject } from "react";
import { AREA_GROUPS, AREAS, CORNER_IDS, isCorner } from "@/lib/exhibition/areas";
import type { AreaId } from "@/lib/exhibition/types";

/**
 * Location list: a collapsible panel on the right (RTL start) on desktop and
 * a bottom sheet on small screens. Closed by default behind a persistent
 * trigger; choosing a location closes it and starts the camera transition.
 */
export function AreaPanelTrigger({
  open,
  onOpenChange,
  triggerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={triggerRef}
      type="button"
      className="exh-btn exh-menu-trigger"
      aria-expanded={open}
      aria-controls="exh-area-panel"
      onClick={() => onOpenChange(!open)}
    >
      <span aria-hidden className="exh-menu-icon" />
      مناطق المعرض
    </button>
  );
}

export function AreaPanel({
  open,
  onOpenChange,
  current,
  onSelect,
  onOverview,
  triggerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: AreaId | null;
  onSelect: (id: AreaId) => void;
  onOverview: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const firstItem = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open) firstItem.current?.focus({ preventScroll: true });
    else if (wasOpen.current) triggerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open, triggerRef]);

  return (
    <>
      <div className="exh-panel-scrim" data-open={open} onClick={() => onOpenChange(false)} aria-hidden />

      <nav
        id="exh-area-panel"
        className="exh-panel"
        data-open={open}
        aria-label="مناطق المعرض"
        inert={!open}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onOpenChange(false);
          }
        }}
      >
        <div className="exh-panel-head">
          <span aria-hidden className="exh-panel-grip" />
          <p className="exh-panel-title">اختر وجهتك</p>
          <button type="button" className="exh-panel-close" onClick={() => onOpenChange(false)}>
            إغلاق
          </button>
        </div>

        <p className="exh-panel-legend">الكتل الشفافة في المشهد تصاميم قيد الإعداد</p>

        <button
          ref={firstItem}
          type="button"
          className="exh-panel-item exh-panel-overview"
          aria-current={current === null ? "location" : undefined}
          onClick={onOverview}
        >
          <span className="exh-panel-badge" aria-hidden>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 7.5 8 2.5l6 5M3.5 6.5V13.5h9V6.5" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="exh-panel-name">المنظر العام</span>
          {current === null && <span className="exh-panel-here">أنت هنا</span>}
        </button>

        {AREA_GROUPS.map((group) => (
          <section key={group.title} className="exh-panel-group">
            <h4>{group.title}</h4>
            <ul>
              {group.ids.map((id) => {
                const area = AREAS[id];
                const here = id === current;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="exh-panel-item"
                      aria-current={here ? "location" : undefined}
                      onClick={() => onSelect(id)}
                    >
                      <span className="exh-panel-badge" aria-hidden>
                        {isCorner(id) ? CORNER_IDS.indexOf(id) + 1 : "•"}
                      </span>
                      <span className="exh-panel-name">
                        {area.content.name}
                        {area.model === "placeholder" && <small>تصميم قيد الإعداد</small>}
                      </span>
                      {here && <span className="exh-panel-here">أنت هنا</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
    </>
  );
}
