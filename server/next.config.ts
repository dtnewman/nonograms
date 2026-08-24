import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: { serverActions: { bodySizeLimit: "64kb" } },
}

export default nextConfig
