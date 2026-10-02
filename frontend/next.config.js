/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: {
    // Lift the default 10 MB proxy body-clone cap so large file uploads
    // (300 MB–10 GB) are not silently truncated before reaching the backend.
    // Next 16's proxy runtime (src/proxy.js) reads this exact key —
    // `config.experimental.proxyClientMaxBodySize` (resolve-routes.js). The
    // value is compared as a raw number of bytes (body-streams.js), so it MUST
    // be a number, not a "10gb" string (which coerces to NaN). 10 GiB.
    proxyClientMaxBodySize: 10 * 1024 * 1024 * 1024,
     //output: "standalone", // for docker image
  },
};

export default nextConfig;
