const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The browser tools open the dev server on 127.0.0.1 while Next prints localhost.
  allowedDevOrigins: ["127.0.0.1"],
  // This folder sits next to another Next.js app, so pin Turbopack to this project.
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;
