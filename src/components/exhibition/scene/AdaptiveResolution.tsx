"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

/** Frames needed per decision (only frames rendered back-to-back, i.e. while moving). */
const WINDOW = 24;
/** Below this frame rate the render scale steps down; above the upper one it may step back up. */
const SLOW = 1 / 40;
const FAST = 1 / 57;
/** Lowest render scale (fraction of a CSS pixel) a slow GPU is allowed to fall to. */
const FLOOR = 0.75;

/** Dev-only switch (window.__exh.adaptive) so measurements run at a fixed resolution. */
export const adaptiveControl = { enabled: true };

/** The pixel ratio the Canvas starts with (its `dpr={[1, max]}` clamp). */
const capFor = (max: number) => Math.min(Math.max(window.devicePixelRatio || 1, 1), max);

/**
 * Keeps camera flights and look-around fluid on slow GPUs. The scene only
 * renders while something moves (frameloop "demand"), so those are the only
 * frames sampled. If they run slower than ~40 fps the pixel ratio steps down
 * (never below FLOOR); if they are comfortably fast it steps back up, never
 * above the tier's cap. Capable devices never leave the cap, so they see no
 * change. Shader compilation in the first frames is ignored. The value is
 * reported through `onChange` and must be fed back as the Canvas `dpr` prop
 * (R3F re-applies that prop on every Canvas render).
 */
export function AdaptiveResolution({ max, onChange }: { max: number; onChange: (dpr: number) => void }) {
  const st = useRef({ dpr: 0, samples: [] as number[], warm: 0, fastRuns: 0 });

  useFrame((_, dt) => {
    const s = st.current;
    if (!adaptiveControl.enabled) return;
    if (!s.dpr) s.dpr = capFor(max);
    // Gaps after idle are not frame times; the first rendered frames compile shaders.
    if (dt <= 0 || dt > 0.25) return;
    if (s.warm < 90) {
      s.warm += 1;
      return;
    }
    s.samples.push(dt);
    if (s.samples.length < WINDOW) return;
    const sorted = s.samples.sort((a, b) => a - b);
    const median = sorted[sorted.length >> 1];
    s.samples = [];
    const cap = capFor(max);
    let next = s.dpr;
    if (median > SLOW && s.dpr > FLOOR) {
      next = Math.max(FLOOR, s.dpr * 0.8);
      s.fastRuns = 0;
    } else if (median < FAST && s.dpr < cap) {
      // Step up only after two fast windows in a row (avoids oscillating).
      s.fastRuns += 1;
      if (s.fastRuns >= 2) {
        next = Math.min(cap, s.dpr * 1.15);
        s.fastRuns = 0;
      }
    } else {
      s.fastRuns = 0;
    }
    if (Math.abs(next - s.dpr) > 0.01) {
      s.dpr = next;
      onChange(next);
    }
  });

  return null;
}
