/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["nextjs-ecommerce-template-main.test"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "nextjs-ecommerce-template-main.test",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "next-commerce-backend.test",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "cdn.brandfetch.io",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
