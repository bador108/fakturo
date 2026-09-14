/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @sparticuz/chromium má binárku (bin/) vedle JS kódu — když ho Next.js webpackem
    // přebalí, cesta k binárce se rozbije. Musí zůstat jako normální require z node_modules.
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    // Zajistí, že TTF fonty (embedované do HTML pro PDF) se zabalí do serverless
    // funkcí, i když se čtou dynamicky přes fs/path.join. (Next.js 14.2 chce tohle
    // pod experimental — top-level klíč vypisuje "Unrecognized key(s)" varování.)
    outputFileTracingIncludes: {
      '/api/pdf/**/*': ['./src/fonts/**/*'],
      '/api/invoices/[id]/send/**/*': ['./src/fonts/**/*'],
    },
  },
};

export default nextConfig;
