"use client";

import { useEffect, useMemo, useRef } from "react";

const VIEW_W = 1600;
const VIEW_H = 900;
const R = 46; // hexagon radius (flat-top, like the brand pattern)
const HEX_H = Math.sqrt(3) * R;
const COLORS = ["var(--color-coral)", "var(--color-fuchsia)", "var(--color-green)", "var(--color-navy-light)"];

interface Cell {
  x: number;
  y: number;
  points: string;
  /** Brand colour this cell lights up with. */
  color: string;
  /** Some cells are softly filled at rest, like the brand pattern. */
  filled: boolean;
  /** Some cells breathe on their own; the value is the animation delay. */
  pulse: number | null;
}

/** Deterministic pseudo-random so server and client render the same grid. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function buildCells(tone: "mono" | "color"): Cell[] {
  const cells: Cell[] = [];
  const cols = Math.ceil(VIEW_W / (R * 1.5)) + 2;
  const rows = Math.ceil(VIEW_H / HEX_H) + 2;
  let i = 0;
  for (let c = -1; c < cols; c++) {
    for (let r = -1; r < rows; r++) {
      const x = c * R * 1.5;
      const y = r * HEX_H + (c % 2 ? HEX_H / 2 : 0);
      const inner = R - 4; // leaves the thin gap the brand pattern has
      const points = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k;
        return `${(x + inner * Math.cos(a)).toFixed(1)},${(y + inner * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      const n = rand(++i);
      cells.push({
        x,
        y,
        points,
        color: COLORS[Math.floor(rand(i + 1000) * COLORS.length)],
        filled: tone === "color" ? n < 0.12 : n < 0.08,
        pulse: n > 0.94 ? rand(i + 2000) * 8 : null,
      });
    }
  }
  return cells;
}

/**
 * The brand's hexagon pattern as a live background: cells near the pointer
 * light up in the KORA colours and a few breathe on their own. Purely
 * decorative; it listens to pointer movement over its parent section only.
 */
export function HexField({
  tone = "mono",
  className = "",
}: {
  tone?: "mono" | "color";
  className?: string;
}) {
  const cells = useMemo(() => buildCells(tone), [tone]);
  const svg = useRef<SVGSVGElement>(null);
  const polys = useRef<(SVGPolygonElement | null)[]>([]);

  useEffect(() => {
    const el = svg.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    let frame = 0;
    let point: { x: number; y: number } | null = null;
    const lit = new Set<number>();

    const paint = () => {
      frame = 0;
      const next = new Set<number>();
      if (point) {
        cells.forEach((cell, index) => {
          const d = Math.hypot(cell.x - point!.x, cell.y - point!.y);
          if (d < R * 3.2) next.add(index);
        });
      }
      lit.forEach((index) => {
        if (!next.has(index)) polys.current[index]?.removeAttribute("data-lit");
      });
      next.forEach((index) => polys.current[index]?.setAttribute("data-lit", ""));
      lit.clear();
      next.forEach((index) => lit.add(index));
    };

    const onMove = (event: PointerEvent) => {
      const ctm = el.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
      point = { x: p.x, y: p.y };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      point = null;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [cells]);

  return (
    <svg
      ref={svg}
      aria-hidden
      className={`hex-field ${className}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {cells.map((cell, index) => (
        <polygon
          key={index}
          ref={(node) => {
            polys.current[index] = node;
          }}
          points={cell.points}
          className={cell.pulse !== null ? "hex-cell hex-pulse" : "hex-cell"}
          data-filled={cell.filled || undefined}
          style={
            {
              "--hex": cell.color,
              animationDelay: cell.pulse !== null ? `${cell.pulse.toFixed(2)}s` : undefined,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}
