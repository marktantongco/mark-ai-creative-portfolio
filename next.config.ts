import type { NextConfig } from "next";

// For GitHub Pages static export, set NEXT_STATIC_EXPORT=true
// For Vercel deployment, use default standalone output
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  // GitHub Pages deploys to /mark-ai-creative-portfolio/ subpath
  basePath: isStaticExport ? "/mark-ai-creative-portfolio" : "",
  assetPrefix: isStaticExport ? "/mark-ai-creative-portfolio/" : "",
  // Static export doesn't support image optimization API
  images: isStaticExport ? { unoptimized: true } : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
