"use client";

import { useEffect, useState } from "react";
import type * as THREE from "three";

/** Builds a texture asynchronously (fonts/images) and disposes it on unmount. */
export function useAsyncTexture(factory: () => Promise<THREE.Texture>) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    factory().then((t) => {
      made = t;
      if (alive) setTex(t);
      else t.dispose();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
    // Factories are module-level and stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return tex;
}
