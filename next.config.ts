import type { NextConfig } from "next";

/**
 * Static export so the CRUSH IT suite deploys anywhere — GitHub Pages,
 * Netlify, Vercel, or any static host — with no server required.
 *
 * If you deploy to a GitHub Pages *project* site (e.g.
 * https://<user>.github.io/crushit), set BASE_PATH=/crushit at build time.
 */
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
