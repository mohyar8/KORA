"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * The KORA ball as a large watermark that rolls and drifts as its section
 * scrolls past. Decorative only.
 */
export function SpinningBall({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-90, 200]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <div ref={ref} aria-hidden className={`spinning-ball ${className}`}>
      <motion.img
        src="/assets/brand/kora-field-ball.png"
        alt=""
        width={1024}
        height={1024}
        loading="lazy"
        style={reduced ? undefined : { rotate, y }}
      />
    </div>
  );
}
