/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @sparticuz/chromium má binárku (bin/) vedle JS kódu — když ho Next.js webpackem
    // přebalí, cesta k binárce se rozbije. Musí zůstat jako normální require z node_modules.
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    // Zajistí, že TTF fonty (embedované do HTML pro PDF) se zabalí do serverless
    // funkcí, i když se čtou dynamicky přes fs/path.join. (Next.js 14.2 chce tohle
    // pod experimental — top-level klíč vypisuje "Unrecognized key(s)" varování.)
    // 'externalPackages' samo o sobě neřeší, že Next.js do serverless bundlu
    // netahá binárku Chromia (bin/) — musí se přidat explicitně, jinak
    // chromium.executablePath() spadne s "input directory does not exist".
    outputFileTracingIncludes: {
      '/api/pdf/**/*': ['./src/fonts/**/*', './node_modules/@sparticuz/chromium/bin/**/*'],
      '/api/invoices/[id]/send/**/*': ['./src/fonts/**/*', './node_modules/@sparticuz/chromium/bin/**/*'],
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

export default nextConfig;
