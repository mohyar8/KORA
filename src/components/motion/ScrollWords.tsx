"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

interface Part {
  text: string;
  className?: string;
}

/**
 * A heading whose words light up one after another as it scrolls into view;
 * it is fully lit by the time its top reaches the middle of the screen.
 * Reduced motion shows the finished heading straight away.
 */
export function ScrollWords({
  parts,
  className,
  id,
  as: Tag = "h2",
}: {
  parts: Part[];
  className?: string;
  id?: string;
  as?: "h1" | "h2";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 55%"] });

  const words = parts.flatMap((part) =>
    part.text
      .split(" ")
      .filter(Boolean)
      .map((word) => ({ word, className: part.className })),
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((item, index) => (
        <Word
          key={index}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1) / words.length]}
          className={item.className}
          still={Boolean(reduced)}
        >
          {item.word}
        </Word>
      ))}
    </Tag>
  );
}

function Word({
  children,
  progress,
  range,
  className,
  still,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
  still: boolean;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <>
      <motion.span className={className} style={still ? undefined : { opacity }}>
        {children}
      </motion.span>{" "}
    </>
  );
}
