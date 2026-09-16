import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/invoices',
        '/clients',
        '/expenses',
        '/finance',
        '/recurring',
        '/settings',
        '/zpravy',
        '/checkout',
        '/api/',
      ],
    },
    sitemap: 'https://fakturo.online/sitemap.xml',
  }
}
