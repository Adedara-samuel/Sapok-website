import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // nodemailer and the MongoDB driver run only on the server
  serverExternalPackages: ["nodemailer", "mongodb"],
};

export default nextConfig;
