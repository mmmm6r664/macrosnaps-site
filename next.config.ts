import type { NextConfig } from "next";
import { redirects } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  images: { loader: "custom", loaderFile: "./src/lib/wix-loader.ts" },
  async redirects() { return redirects; },
  poweredByHeader: false,
};

export default nextConfig;
