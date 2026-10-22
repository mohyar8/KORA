"use client";

import { useEffect, useRef } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";
const LOGO_SRC = "/assets/brand/kora-main-tight.svg";

/** Status line for a loading fraction. */
function labelFor(p: number) {
  if (p < 0.5) return "نحمّل المعرض…";
  if (p < 0.65) return "نبني المشهد ثلاثي الأبعاد…";
  if (p < 0.86) return "نجهّز الأجنحة والإضاءة…";
  if (p < 0.97) return "نهيّئ العرض ليكون سلسًا…";
  return "لحظات ونبدأ الجولة…";
}

/**
 * Branded loading screen shown over the poster until the 3D scene is ready
 * (owner request, 2026-10-13). The official KORA logo file is loaded as is
 * and its own pieces (ball panels, then the letters, right to left) fly in
 * and assemble — nothing is redrawn. A coral line shows real loading
 * progress so the page never looks frozen. Reduced motion: the logo simply
 * appears.
 */
export function LoadingScreen({ progress, hidden }: { progress: number; hidden: boolean }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(LOGO_SRC)
      .then((r) => r.text())
      .then((text) => {
        const el = host.current;
        if (!alive || !el) return;
        const src = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
        if (src.nodeName.toLowerCase() !== "svg") return;
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("viewBox", src.getAttribute("viewBox") ?? "0 0 1080 800");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("class", "exh-loading-logo");
        // Each official path in its own group, so CSS can move the group
        // while the path keeps its own placement transform.
        const pieces = Array.from(src.querySelectorAll("path")).map((path) => {
          const g = document.createElementNS(SVG_NS, "g");
          g.setAttribute("class", "exh-logo-piece");
          g.appendChild(document.importNode(path, true));
          svg.appendChild(g);
          return g;
        });
        el.replaceChildren(svg);
        const [vx, vy, vw, vh] = (svg.getAttribute("viewBox") ?? "0 0 1080 800").split(/\s+/).map(Number);
        const cx = vx + vw / 2;
        const cy = vy + vh / 2;
        const boxes = pieces.map((g) => g.getBBox());
        // Ball panels (upper part of the mark) first, then the letters right to left.
        const ballLine = vy + vh * 0.42;
        const order = pieces
          .map((g, i) => ({ g, b: boxes[i] }))
          .sort((a, b) => {
            const ab = a.b.y + a.b.height / 2 < ballLine ? 0 : 1;
            const bb = b.b.y + b.b.height / 2 < ballLine ? 0 : 1;
            return ab - bb || b.b.x - a.b.x;
          });
        order.forEach(({ g, b }, k) => {
          const px = b.x + b.width / 2;
          const py = b.y + b.height / 2;
          // Fly in from further out along the line from the logo's centre.
          g.style.setProperty("--dx", `${(px - cx) * 0.9}px`);
          g.style.setProperty("--dy", `${(py - cy) * 0.9 - 60}px`);
          g.style.setProperty("--rot", `${(k % 2 ? 1 : -1) * (14 + (k % 5) * 6)}deg`);
          g.style.setProperty("--i", String(k));
        });
        requestAnimationFrame(() => svg.classList.add("is-assembling"));
      })
      .catch(() => {
        /* the progress line and label still show */
      });
    return () => {
      alive = false;
    };
  }, []);

  const pct = Math.round(progress * 100);
  return (
    <div className="exh-loading" data-hidden={hidden} role="status" aria-live="polite" aria-busy={!hidden}>
      <div className="exh-loading-inner">
        <div ref={host} className="exh-loading-mark" />
        <div className="exh-loading-bar" aria-hidden>
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="exh-loading-label">
          {labelFor(progress)}{" "}
          <span dir="ltr" aria-hidden>
            {pct}%
          </span>
        </p>
      </div>
    </div>
  );
}
