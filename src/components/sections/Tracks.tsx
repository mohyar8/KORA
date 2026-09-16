"use client";

import { useId, useState } from "react";
import { TRACKS } from "@/lib/content";

const SHORT_TRACK_TITLES = ["المتحف", "إعلام", "اقتصاد", "ريادة", "ترفيه", "المسرح"] as const;

export function Tracks() {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <section id="tracks" aria-labelledby="tracks-heading" className="tracks-section">
      <header className="section-mast">
        <div className="pent-nav" aria-label="اختيار مسار">
          {TRACKS.map((track, index) => (
            <button
              key={track.number}
              type="button"
              aria-label={`عرض مسار ${track.title}`}
              aria-pressed={open === index}
              className="kora-pentagon"
              onMouseEnter={() => setOpen(index)}
              onFocus={() => setOpen(index)}
              onClick={() => setOpen(index)}
            >{track.number}</button>
          ))}
        </div>
      </header>
      <h2 id="tracks-heading" className="sr-only">مسارات الحدث وأركانه</h2>

      <div className="track-rail">
        {TRACKS.map((track, index) => {
          const active = open === index;
          const panelId = `${baseId}-${index}`;
          return (
            <article key={track.number} className="track-panel" data-open={active}>
              <button
                type="button"
                aria-expanded={active}
                aria-controls={panelId}
                onClick={() => setOpen(index)}
                onMouseEnter={() => setOpen(index)}
              >
                <span className="track-code">{track.number}</span>
                <span className="track-dot kora-pentagon" />
                <span className="track-title">
                  {active ? track.title : SHORT_TRACK_TITLES[index]}
                </span>
                <span id={panelId} className="track-body">{track.description}</span>
              </button>
              <span aria-hidden className="track-art kora-pentagon" />
            </article>
          );
        })}
      </div>
    </section>
  );
}
