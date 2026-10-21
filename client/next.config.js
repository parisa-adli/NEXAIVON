// Images uploaded to the API server (FR-API-17) are served from its /uploads
// path, so next/image must allow that host. Derived from the API URL so each
// environment allows its own server.
function apiUploadsPattern() {
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  const { protocol, hostname, port } = new URL(process.env.NEXT_PUBLIC_API_URL);
  return [
    {
      protocol: protocol.replace(":", ""),
      hostname,
      port,
      pathname: "/uploads/**",
    },
  ];
}

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
      ...apiUploadsPattern(),
    ],
  },
};

module.exports = nextConfig;
