import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // only the Docker build (see Dockerfile) wants the self-contained server; `next start` keeps working elsewhere
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
  // "use cache" + static shells with streamed dynamic parts
  cacheComponents: true,
  // links prefetch one shared App Shell per route instead of a full render per link
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/media/**",
      }
    ],
    minimumCacheTTL: 3600,
    // 40: blurred backdrops, where detail is invisible anyway
    qualities: [40, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  }
};

export default nextConfig;
