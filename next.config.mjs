/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // No ESLint config is bundled with this project; skip the lint step
    // during `next build` so Vercel's non-interactive build doesn't stall.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
