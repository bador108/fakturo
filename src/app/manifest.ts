import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fakturo — Online fakturace',
    short_name: 'Fakturo',
    description: 'Profesionální fakturace pro freelancery a malé firmy.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#fafaf8',
    theme_color: '#16a34a',
    orientation: 'portrait-primary',
    lang: 'cs',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
