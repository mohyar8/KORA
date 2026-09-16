import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root — a stray lockfile in a parent Downloads
    // folder otherwise makes Turbopack guess the wrong project root.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
