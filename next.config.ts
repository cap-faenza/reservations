import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  experimental: {
    serverActions: {
      // Le immagini hero possono arrivare fino a 5 MB
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
