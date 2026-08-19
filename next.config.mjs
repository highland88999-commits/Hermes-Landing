/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows images from any secure domain (optional, but helpful for user submissions)
      },
    ],
  },
};

export default nextConfig;
