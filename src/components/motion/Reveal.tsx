"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "none";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  as?: "div" | "span" | "li";
  /** Forwarded to Framer's `viewport.amount` — how much must be visible to trigger. */
  amount?: number;
}

const DISTANCE = 28;

function buildVariants(direction: Direction, reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.25 } },
    };
  }
  return {
    hidden: {
      opacity: 0,
      y: direction === "up" ? DISTANCE : 0,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };
}

/**
 * Fades (and optionally rises) a block into place the first time it enters
 * the viewport. Collapses to a plain fade when reduced motion is requested.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as = "div",
  amount = 0.3,
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={buildVariants(direction, Boolean(reduced))}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
