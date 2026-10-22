"use client";

import { createContext, useContext } from "react";

export type Quality = {
  tier: "high" | "mobile";
  dpr: [number, number];
  msaa: number;
  shadows: boolean;
  /** Extra local point lights (exit, poles). */
  lights: boolean;
  facadeTex: number;
  groundTex: number;
  treeCount: number;
};

export const QUALITY: Record<Quality["tier"], Quality> = {
  high: {
    tier: "high",
    dpr: [1, 1.5],
    // 2× (was 4×): measured −10–15 % GPU frame time on an integrated GPU with
    // no visible difference from 4× at this pixel density (perf pass 2026-10-14).
    msaa: 2,
    shadows: true,
    lights: true,
    facadeTex: 4096,
    groundTex: 2048,
    treeCount: 150,
  },
  mobile: {
    tier: "mobile",
    dpr: [1, 1.25],
    msaa: 2,
    shadows: false,
    lights: false,
    facadeTex: 2048,
    groundTex: 1024,
    treeCount: 80,
  },
};

export function detectQuality(): Quality {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.screen.width, window.screen.height) < 768;
  return coarse || small ? QUALITY.mobile : QUALITY.high;
}

export const QualityContext = createContext<Quality>(QUALITY.high);
export const useQuality = () => useContext(QualityContext);
