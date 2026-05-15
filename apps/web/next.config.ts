import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // postgres-js uses pg/node bindings that should not be bundled by webpack
  // — keep it external to the server build.
  serverExternalPackages: ["postgres"],
  images: {
    remotePatterns: [
      // Vercel Blob public hostnames look like
      // <random>.public.blob.vercel-storage.com
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
