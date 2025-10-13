/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ["@repo/ui"],
  rewrites: async () => {
    return [
      // Rewrite form URLs to remove /forms/ from the path
      {
        source: '/fitnessbr',
        destination: '/forms/fitnessbr',
      },
      {
        source: '/fitnessusa',
        destination: '/forms/fitnessusa',
      },
      {
        source: '/nutritionbr',
        destination: '/forms/nutritionbr',
      },
      {
        source: '/nutritionusa',
        destination: '/forms/nutritionusa',
      },
      {
        source: '/professional-consultation',
        destination: '/forms/professional-consultation',
      },
       {
        source: '/test-ai',
        destination: '/forms/test-ai',
      },
      // Client diet view
      {
        source: '/diet-view',
        destination: '/client/diet-view',
      },
      {
        source: '/nzcoachonline',
        destination: '/pten/nzcoachonline',
      },
      {
        source: '/ptnz',
        destination: '/pten/ptnz',
      },
    ];
  },
};

module.exports = nextConfig;
