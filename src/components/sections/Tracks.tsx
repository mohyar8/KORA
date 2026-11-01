"use client";

import { useId, useState } from "react";
import { HOME_COPY, TRACKS } from "@/lib/content";

const SHORT_TRACK_TITLES = [
  "المتحف",
  "إعلام",
  "اقتصاد",
  "ريادة",
  "ترفيه",
  "المسرح",
  "صحة",
  "تقنية",
  "هندسة",
] as const;

export function Tracks() {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <section id="tracks" aria-labelledby="tracks-heading" className="tracks-section">
      <header className="section-mast">
        <div className="tracks-intro">
          <h2 id="tracks-heading">{HOME_COPY.tracks.heading}</h2>
          <p>{HOME_COPY.tracks.description}</p>
        </div>
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
