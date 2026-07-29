const apiHostname = new URL(process.env.NEXT_PUBLIC_API_ENDPOINT).hostname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: apiHostname,
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: apiHostname,
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: apiHostname,
        pathname: "/**",
      },
    ],
    // Use custom loader file to handle undefined/null image sources
    loader: "custom",
    loaderFile: "./imageLoader.js",
  },
};

export default nextConfig;
