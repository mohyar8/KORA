import { clsx } from "clsx";

interface PatternBandProps {
  pattern?: "6" | "8";
  className?: string;
}

const SOURCES: Record<"6" | "8", string> = {
  "6": "/assets/patterns/pattern-6.svg",
  "8": "/assets/patterns/pattern-8.svg",
};

/**
 * Decorative repeating strip built from the official Diriyah-window-inspired
 * pattern SVGs. Purely ornamental (a section divider), so it is hidden from
 * assistive tech.
 */
export function PatternBand({ pattern = "6", className }: PatternBandProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx("pattern-band w-full", className)}
      style={{ backgroundImage: `url(${SOURCES[pattern]})` }}
    />
  );
}
