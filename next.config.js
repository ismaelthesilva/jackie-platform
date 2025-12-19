/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "axjeyuxhmoemwlirrksb.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com",
              "frame-src 'self' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://challenges.cloudflare.com https://*.emailjs.com https://*.supabase.co",
            ].join("; "),
          },
        ],
      },
    ];
  },
  rewrites: async () => {
    return [
      // Rewrite form URLs to remove /forms/ from the path
      {
        source: "/fitnessbr",
        destination: "/forms/fitnessbr",
      },
      {
        source: "/fitnessusa",
        destination: "/forms/fitnessusa",
      },
      {
        source: "/nutritionbr",
        destination: "/forms/nutritionbr",
      },
      {
        source: "/nutritionusa",
        destination: "/forms/nutritionusa",
      },
      {
        source: "/professional-consultation",
        destination: "/forms/professional-consultation",
      },
      {
        source: "/test-ai",
        destination: "/forms/test-ai",
      },
      // Client diet view
      {
        source: "/diet-view",
        destination: "/client/diet-view",
      },
      {
        source: "/nzcoachonline",
        destination: "/pten/nzcoachonline",
      },
      {
        source: "/ptnz",
        destination: "/pten/ptnz",
      },
    ];
  },
};

module.exports = nextConfig;
