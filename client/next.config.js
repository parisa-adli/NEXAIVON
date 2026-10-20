/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dkstatics-public.digikala.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rasanika.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
