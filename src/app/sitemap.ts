import type { MetadataRoute } from 'next'
import { posts } from '@/lib/blog'

const BASE_URL = 'https://fakturo.online'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/funkce', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/cenik', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/pravidelne-fakturace', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/generator', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/o-nas', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/kontakt', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/gdpr', priority: 0.2, changeFrequency: 'yearly' as const },
    { path: '/obchodni-podminky', priority: 0.2, changeFrequency: 'yearly' as const },
  ]

  const pages = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  const articles = posts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.published),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...pages, ...articles]
}
