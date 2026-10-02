import sharedConfig from "@repo/next-config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...sharedConfig,
  basePath: '/product',
};

export default nextConfig;
