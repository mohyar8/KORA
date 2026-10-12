"use client";

import { useEffect, useState } from "react";
import type * as THREE from "three";

// Textures still being built. Static batching waits for these, because a
// mesh baked before its texture arrives would keep its fallback look.
let pending = 0;
const waiters = new Set<() => void>();

function settle() {
  pending -= 1;
  if (pending > 0) return;
  for (const resolve of waiters) resolve();
  waiters.clear();
}

/** Whether anything is still pending right now. */
export const asyncWorkPending = () => pending > 0;

/** Resolves once no async texture is still being built. */
export function asyncTexturesSettled(): Promise<void> {
  return pending === 0 ? Promise.resolve() : new Promise((resolve) => waiters.add(resolve));
}

/** Builds a texture asynchronously (fonts/images) and disposes it on unmount. */
export function useAsyncTexture(factory: () => Promise<THREE.Texture>) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    pending += 1;
    factory()
      .then((t) => {
        made = t;
        if (alive) setTex(t);
        else t.dispose();
      })
      .catch((e) => console.warn("[exhibition] texture failed", e))
      .finally(settle);
    return () => {
      alive = false;
      made?.dispose();
    };
    // Factories are module-level and stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return tex;
}
