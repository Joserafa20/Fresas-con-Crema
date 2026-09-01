/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@maison-fraise/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
