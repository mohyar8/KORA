"use client";

import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

interface AnimatedNumberProps {
  /** The target number to count up to (commas are added automatically). */
  value: number;
  className?: string;
}

/**
 * Counts up to `value` once it scrolls into view. Falls back to the plain
 * final number instantly when reduced motion is requested, so the number
 * itself is never the only thing that moves.
 */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (!inView) return;
    motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    if (reduced) return;
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString("en-US");
      }
    });
    return unsubscribe;
  }, [spring, reduced]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={value.toLocaleString("en-US")}
    >
      {reduced ? value.toLocaleString("en-US") : 0}
    </span>
  );
}
