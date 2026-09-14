/** @type {import('next').NextConfig} */
const nextConfig = {
  // Zajistí, že TTF fonty (embedované do HTML pro PDF) a Chromium (@sparticuz/chromium)
  // se zabalí do serverless funkcí, i když se čtou dynamicky přes fs/path.join.
  outputFileTracingIncludes: {
    '/api/pdf/**/*': ['./src/fonts/**/*'],
    '/api/invoices/[id]/send/**/*': ['./src/fonts/**/*'],
  },
};

export default nextConfig;
