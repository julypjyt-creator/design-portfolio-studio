import type { NextConfig } from "next";

const ossHost = process.env.NEXT_PUBLIC_OSS_HOST?.trim();

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "**.aliyuncs.com" }
];

if (ossHost) {
  remotePatterns.push({ protocol: "https", hostname: ossHost });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns
  }
};

export default nextConfig;
