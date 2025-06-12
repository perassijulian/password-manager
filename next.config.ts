import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src *; connect-src *; font-src *; frame-src *; report-uri /api/csp-report",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
