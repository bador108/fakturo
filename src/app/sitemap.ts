import type { MetadataRoute } from 'next'

const BASE_URL = 'https://fakturo.online'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/funkce', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/cenik', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/pravidelne-fakturace', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/generator', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/o-nas', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/kontakt', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/gdpr', priority: 0.2, changeFrequency: 'yearly' as const },
    { path: '/obchodni-podminky', priority: 0.2, changeFrequency: 'yearly' as const },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
