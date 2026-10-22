"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

/** Frames needed per decision (only frames rendered back-to-back, i.e. while moving). */
const WINDOW = 24;
/** Below this frame rate the render scale steps down; above the upper one it may step back up. */
const SLOW = 1 / 40;
const FAST = 1 / 57;
/** Lowest render scale (fraction of a CSS pixel) a slow GPU is allowed to fall to. */
const FLOOR = 0.75;
/** Frame time the starting resolution aims for (between SLOW and FAST). */
const TARGET_MS = 22;
/** A pending change is applied once no frame has rendered for this long (camera at rest). */
const SETTLE_MS = 180;

/**
 * Shared switches: `enabled` (dev hook `__exh.adaptive`, fixed-resolution
 * measurements) and `seed`, the starting pixel ratio measured behind the
 * loading screen (see `startingScale`).
 */
export const adaptiveControl = { enabled: true, seed: 0 };

/** The pixel ratio the Canvas starts with (its `dpr={[1, max]}` clamp). */
const capFor = (max: number) => Math.min(Math.max(window.devicePixelRatio || 1, 1), max);

/**
 * Starting pixel ratio from the median of a few full frames rendered while
 * the loading screen still covers the stage. GPU cost grows with the pixel
 * count (ratio²), so the ratio scales with √(target / measured). Capable
 * devices stay at the cap.
 */
export function startingScale(max: number, medianMs: number) {
  const cap = capFor(max);
  if (!(medianMs > TARGET_MS)) return cap;
  return Math.max(FLOOR, Math.min(cap, cap * Math.sqrt(TARGET_MS / medianMs)));
}

/**
 * Keeps camera flights and look-around fluid on slow GPUs. The scene only
 * renders while something moves (frameloop "demand"), so those are the only
 * frames sampled. If they run slower than ~40 fps the pixel ratio steps down
 * (never below FLOOR); if they are comfortably fast it steps back up, never
 * above the tier's cap. Capable devices never leave the cap, so they see no
 * change. Shader compilation in the first frames is ignored.
 *
 * A change is never applied mid-motion: resizing reallocates the canvas and
 * every post-processing buffer (measured 79 ms hitches and a visible jump in
 * sharpness during the first flight, production build, 2026-10-14). It waits
 * until the camera is at rest; the starting ratio is measured at load so the
 * first flight already runs at the right one. The value is reported through
 * `onChange` and must be fed back as the Canvas `dpr` prop (R3F re-applies
 * that prop on every Canvas render).
 */
export function AdaptiveResolution({ max, onChange }: { max: number; onChange: (dpr: number) => void }) {
  const st = useRef({ dpr: 0, seed: 0, samples: [] as number[], warm: 0, fastRuns: 0, pending: 0, slowAt: 0, timer: 0 });

  useEffect(() => () => window.clearTimeout(st.current.timer), []);

  useFrame((_, dt) => {
    const s = st.current;
    if (!adaptiveControl.enabled) return;
    if (adaptiveControl.seed && adaptiveControl.seed !== s.seed) {
      s.seed = adaptiveControl.seed;
      s.dpr = s.seed;
      s.samples = [];
      // Seeded below the cap = the cap was measured too slow.
      if (s.seed < capFor(max) - 0.01) s.slowAt = capFor(max);
    }
    if (!s.dpr) s.dpr = capFor(max);
    sample(s, dt, max);
    // Any frame means motion: postpone a pending change until it stops.
    if (s.pending) {
      window.clearTimeout(s.timer);
      s.timer = window.setTimeout(() => {
        if (!s.pending) return;
        s.dpr = s.pending;
        s.pending = 0;
        onChange(s.dpr);
      }, SETTLE_MS);
    }
  });

  return null;
}

type AdaptiveState = { dpr: number; samples: number[]; warm: number; fastRuns: number; pending: number; slowAt: number };

/** Adds one frame time; after a full window, records the next ratio as `pending`. */
function sample(s: AdaptiveState, dt: number, max: number) {
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
  // Judge the ratio actually rendered (a pending change is not applied yet).
  const rendered = s.dpr;
  let next = rendered;
  if (median > SLOW && rendered > FLOOR) {
    // One decisive step towards the target (cost ∝ ratio²), at least −10 %.
    s.slowAt = Math.min(s.slowAt || Infinity, rendered);
    next = Math.max(FLOOR, rendered * Math.min(0.9, Math.sqrt(TARGET_MS / 1000 / median)));
    s.fastRuns = 0;
  } else if (median < FAST && rendered < cap) {
    // Step up only after two fast windows in a row, and never back to a
    // ratio already found too slow (no see-saw between arrivals).
    s.fastRuns += 1;
    if (s.fastRuns >= 2) {
      next = Math.min(cap, rendered * 1.15, s.slowAt ? s.slowAt * 0.95 : cap);
      s.fastRuns = 0;
    }
  } else {
    s.fastRuns = 0;
  }
  if (Math.abs(next - rendered) > 0.01) s.pending = next;
}
