"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's animation start. */
  gap?: number;
  amount?: number;
  as?: "div" | "ul";
}

const container = (gap: number, reduced: boolean): Variants => ({
  hidden: {},
  show: {
    transition: reduced
      ? { staggerChildren: 0 }
      : { staggerChildren: gap, delayChildren: 0.05 },
  },
});

/** Wrap a list of `StaggerItem`s to fade/rise them in one after another. */
export function Stagger({
  children,
  className,
  gap = 0.09,
  amount = 0.2,
  as = "div",
}: StaggerProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={container(gap, Boolean(reduced))}
    >
      {children}
    </MotionTag>
  );
}

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag className={className} variants={reduced ? itemReduced : item}>
      {children}
    </MotionTag>
  );
}
