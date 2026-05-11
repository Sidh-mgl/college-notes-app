/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent these packages from being bundled by webpack on the server
  // (needed for native bindings / binary modules on Azure Linux)
  serverExternalPackages: ["mongoose", "bcryptjs", "cloudinary"],

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
