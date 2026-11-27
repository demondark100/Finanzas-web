import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = isProd
  ? {}
  : {
      experimental: {
        serverActions: {
          allowedOrigins: [
            "localhost:3000",
            "192.168.1.3:3000",
            "192.168.1.2:3000",
            "192.168.1.4:3000",
            "192.168.1.5:3000",
            "192.168.1.6:3000",
            "192.168.1.7:3000",
            "192.168.1.8:3000",
            "192.168.1.9:3000",
            "192.168.1.10:3000",
          ],
        },
      },
    };

export default nextConfig;
