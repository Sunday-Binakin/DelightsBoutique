import type { NextConfig } from "next";
import path from "path";

// Server-side only (never exposed to the browser) — the real backend host that /api/*
// gets proxied to. Set this in production so the browser only ever talks to this site's
// own domain: the session cookie from /api/auth/verify-otp then lands as first-party
// instead of a cross-site cookie, which Safari and an increasing share of Chrome block
// outright. Leave unset locally — NEXT_PUBLIC_API_URL already points straight at the
// dev backend there, so no proxy is needed.
const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    if (!backendApiUrl) return [];
    return [{ source: "/api/:path*", destination: `${backendApiUrl}/api/:path*` }];
  },
};

export default nextConfig;
