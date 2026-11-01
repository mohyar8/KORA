"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A quiet night pitch behind the hero's story: faint field markings that draw
 * themselves once the section is in view, under a soft floodlight glow.
 */
export function PitchArt() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pitch-art" data-drawn={drawn}>
      <div className="pitch-glow" />
      <svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" className="pitch-lines">
        <g fill="none">
          <rect x="40" y="40" width="1120" height="560" pathLength={1} />
          <path d="M600 40V600" pathLength={1} />
          <circle cx="600" cy="320" r="92" pathLength={1} />
          <path d="M40 180H210V460H40" pathLength={1} />
          <path d="M1160 180H990V460H1160" pathLength={1} />
          <path d="M40 252H96V388H40" pathLength={1} />
          <path d="M1160 252H1104V388H1160" pathLength={1} />
          <path d="M210 266A70 70 0 0 1 210 374" pathLength={1} />
          <path d="M990 266A70 70 0 0 0 990 374" pathLength={1} />
        </g>
        <circle cx="160" cy="320" r="3" className="pitch-spot" />
        <circle cx="1040" cy="320" r="3" className="pitch-spot" />
        <circle cx="600" cy="320" r="26" className="pitch-halo" />
        <circle cx="600" cy="320" r="7" className="pitch-ball" />
      </svg>
    </div>
  );
}
