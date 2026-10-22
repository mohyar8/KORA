import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Always inlined, so normal builds fold the exhibition's profiling hook
  // away; `EXH_PROFILE=1 next build` keeps it (docs/3d-exhibition, STATE §7).
  env: { EXH_PROFILE: process.env.EXH_PROFILE === "1" ? "1" : "" },
  turbopack: {
    // Pin the workspace root — a stray lockfile in a parent Downloads
    // folder otherwise makes Turbopack guess the wrong project root.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
