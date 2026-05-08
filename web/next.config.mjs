/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.kopis.or.kr" },
      { protocol: "http",  hostname: "www.kopis.or.kr" },
    ],
  },
};

export default nextConfig;
