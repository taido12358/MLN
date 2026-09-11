/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@mln/shared"],
  webpack: (config) => {
    // @mln/shared is authored as NodeNext ESM TS (relative imports use explicit ".js" extensions
    // that resolve to the sibling ".ts" file under tsc/tsx). Webpack doesn't know that convention
    // by default, so map it explicitly.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias || {}),
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
