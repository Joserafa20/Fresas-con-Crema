/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@maison-fraise/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
