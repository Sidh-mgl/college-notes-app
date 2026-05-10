/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent mongoose from being bundled by webpack (required for Next.js 15 serverless)
  serverExternalPackages: ["mongoose", "bcryptjs"],

  // Allow next/image to load images from Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
