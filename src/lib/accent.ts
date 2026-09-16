import type { AccentColor } from "./content";

/**
 * Static Tailwind class lookups per accent color. Kept as literal strings
 * (rather than template-built like `bg-${accent}`) so Tailwind's compiler
 * can see and generate every class.
 */
export const ACCENT_STYLES: Record<
  AccentColor,
  { bg: string; text: string; border: string; softBg: string; ring: string }
> = {
  navy: {
    bg: "bg-navy",
    text: "text-navy",
    border: "border-navy",
    softBg: "bg-navy/10",
    ring: "ring-navy",
  },
  fuchsia: {
    bg: "bg-fuchsia",
    text: "text-fuchsia",
    border: "border-fuchsia",
    softBg: "bg-fuchsia/10",
    ring: "ring-fuchsia",
  },
  coral: {
    bg: "bg-coral",
    text: "text-coral",
    border: "border-coral",
    softBg: "bg-coral/10",
    ring: "ring-coral",
  },
  green: {
    bg: "bg-green",
    text: "text-green",
    border: "border-green",
    softBg: "bg-green/10",
    ring: "ring-green",
  },
};
