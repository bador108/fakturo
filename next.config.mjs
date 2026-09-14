/** @type {import('next').NextConfig} */
const nextConfig = {
  // Zajistí, že TTF fonty (embedované do HTML pro PDF) se zabalí do serverless
  // funkcí, i když se čtou dynamicky přes fs/path.join.
  outputFileTracingIncludes: {
    '/api/pdf/**/*': ['./src/fonts/**/*'],
    '/api/invoices/[id]/send/**/*': ['./src/fonts/**/*'],
  },
  // @sparticuz/chromium má binárku (bin/) vedle JS kódu — když ho Next.js webpackem
  // přebalí, cesta k binárce se rozbije. Musí zůstat jako normální require z node_modules.
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
};

export default nextConfig;
