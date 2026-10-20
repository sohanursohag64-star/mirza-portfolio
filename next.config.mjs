/** @type {import('next').NextConfig} */
// CSP note: script-src/style-src need 'unsafe-inline' because Next.js injects its hydration
// data and Tailwind's runtime styles as inline <script>/<style> tags without a nonce in this
// setup. A nonce-based CSP (via middleware) would remove that, at the cost of more wiring —
// worth doing before a high-stakes public launch, not required for this to be safe today.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      // Covers Supabase REST/Auth/Storage (https) and Realtime (wss) for any project ref.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "26mb" }, // default 1 MB is too small for uploads
    serverComponentsExternalPackages: ["sharp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
export default nextConfig;
