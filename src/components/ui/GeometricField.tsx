import { clsx } from "clsx";

const ROWS = [
  { top: "-4%", opacity: 0.14, size: 120, duration: "52s", direction: "normal" as const },
  { top: "22%", opacity: 0.09, size: 90, duration: "70s", direction: "reverse" as const },
  { top: "48%", opacity: 0.12, size: 150, duration: "60s", direction: "normal" as const },
  { top: "76%", opacity: 0.08, size: 100, duration: "80s", direction: "reverse" as const },
];

/**
 * Ambient hex-grid backdrop built from the official pattern-6 asset,
 * layered as several slow-drifting horizontal bands. Purely decorative
 * (CSS animation only, frozen automatically under prefers-reduced-motion by
 * the global rule in globals.css), so it stays out of the accessibility
 * tree.
 */
export function GeometricField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {ROWS.map((row, index) => (
        <div
          key={index}
          className="animate-marquee absolute inset-x-0 w-[200%]"
          style={{
            top: row.top,
            height: row.size,
            opacity: row.opacity,
            backgroundImage: "url(/assets/patterns/pattern-6.svg)",
            backgroundRepeat: "repeat-x",
            backgroundSize: `auto ${row.size}px`,
            animationDuration: row.duration,
            animationDirection: row.direction,
          }}
        />
      ))}
    </div>
  );
}
