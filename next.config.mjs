import { buildOrderingUrl, orderingTarget } from "./src/lib/ordering-url.config.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Resolve from project root so Turbopack finds next/package.json (fixes workspace root inference)
    root: ".",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://pos.codevertexafrica.com https://www.google.com https://maps.google.com;",
          },
        ],
      },
    ];
  },
  // The menu lives in the online store (ordering service); the website has no copy of it.
  async redirects() {
    const store = orderingTarget();
    return [
      { source: "/menu", destination: buildOrderingUrl(store, "/catalog"), permanent: false },
      { source: "/menu/:path*", destination: buildOrderingUrl(store, "/catalog"), permanent: false },
    ];
  },
};

export default nextConfig;
