import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Thumbnails in the real app are served from object storage (Vercel Blob /
    // UploadThing / S3). Add your bucket host here so next/image can optimize it.
    remotePatterns: [
      // { protocol: "https", hostname: "your-bucket.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
