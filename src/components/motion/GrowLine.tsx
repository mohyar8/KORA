"use client";

import { motion, useReducedMotion } from "motion/react";

/** A rule that draws itself (right to left) when scrolled into view. */
export function GrowLine({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={className}
      style={{ transformOrigin: "right" }}
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
