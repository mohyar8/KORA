"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useIsFinePointer } from "@/lib/hooks/useIsFinePointer";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Max pixel offset the element travels toward the pointer. */
  strength?: number;
}

/**
 * Nudges its child toward the pointer on hover (mouse/trackpad only).
 * On touch devices, or with reduced motion requested, it renders inert —
 * the button stays fully usable, just without the flourish.
 *
 * Framer Motion manages `transform` on its motion elements outside of
 * React's normal SSR-able render, which always disagrees with the server
 * markup and logs a hydration warning. Since the effect is a pointer-only
 * enhancement anyway, the plain (non-motion) wrapper is rendered until after
 * mount, then swapped for the animated one — server and first client paint
 * stay identical, and the swap itself happens after hydration completes.
 */
export function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const [mounted, setMounted] = useState(false);
  // Standard hydration-safe "mounted" gate: this can only ever run once,
  // purely to swap in the client-only motion wrapper after hydration — not
  // state derived from anything available at render time.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={className}>{children}</div>;

  return (
    <MagneticActive className={className} strength={strength}>
      {children}
    </MagneticActive>
  );
}

function MagneticActive({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isFinePointer = useIsFinePointer();
  const reduced = useReducedMotion();
  const enabled = isFinePointer && !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relativeX = event.clientX - (rect.left + rect.width / 2);
    const relativeY = event.clientY - (rect.top + rect.height / 2);
    x.set((relativeX / (rect.width / 2)) * strength);
    y.set((relativeY / (rect.height / 2)) * strength);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}
