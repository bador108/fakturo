import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostBody } from '@/components/blog/PostBody'
import { posts, getPost, readingMinutes, formatBlogDate } from '@/lib/blog'

const BASE = 'https://fakturo.online'

export const dynamicParams = false

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug)
  if (!post) return {}
  const url = `${BASE}/blog/${post.slug}`
  return {
    title: `${post.title} – Fakturo`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
    },
  }
}

const C = {
  bg: '#ffffff', fg: '#0c0c0e', fg2: '#1f1f23', muted: '#6b7280', border: '#ececef', primary: '#16a34a',
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const url = `${BASE}/blog/${post.slug}`
  const related = post.related.map(getPost).filter((p): p is NonNullable<typeof p> => Boolean(p))

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    inLanguage: 'cs',
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Fakturo', url: BASE },
    publisher: { '@type': 'Organization', name: 'Fakturo', logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` } },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fakturo', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }

  return (
    <div style={{ background: C.bg, color: C.fg }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 40px' }}>
        <nav aria-label="Drobečková navigace" style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
          <Link href="/blog" style={{ color: C.muted, textDecoration: 'none' }}>Blog</Link>
          <span aria-hidden style={{ margin: '0 8px' }}>/</span>
          <span>{post.category}</span>
        </nav>

        <h1 style={{ fontWeight: 600, fontSize: 'clamp(2.1rem, 4.6vw, 3.4rem)', lineHeight: 1.05, letterSpacing: -2, margin: '0 0 20px' }}>
          {post.title}
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, color: C.muted, margin: '0 0 20px' }}>{post.description}</p>
        <div style={{ fontSize: 14, color: C.muted, paddingBottom: 32, marginBottom: 40, borderBottom: `1px solid ${C.border}` }}>
          {formatBlogDate(post.updated ?? post.published)} · {readingMinutes(post)} min čtení
        </div>

        <PostBody blocks={post.blocks} />

        <p style={{ fontSize: 13, lineHeight: 1.6, color: C.muted, margin: '40px 0 0' }}>
          Článek je obecný přehled a nenahrazuje daňové ani právní poradenství. Předpisy se mění, u konkrétní situace si informace ověř na webu Finanční správy nebo u své účetní.
        </p>
      </article>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '16px 24px 32px' }}>
        <div style={{ padding: '32px 32px 36px', borderRadius: 18, border: `1px solid ${C.border}` }}>
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, lineHeight: 1.15, margin: '0 0 10px' }}>Vystav fakturu za 30 vteřin</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: C.muted, margin: '0 0 22px' }}>
            Pět faktur měsíčně zdarma, bez kreditní karty. Fakturo hlídá platby a posílá upomínky za tebe.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link
              href="/sign-up"
              className="transition-transform duration-150 ease-out hover:-translate-y-0.5"
              style={{ background: C.primary, color: C.bg, padding: '13px 22px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
            >
              Začít zdarma →
            </Link>
            <Link
              href="/generator"
              className="transition-transform duration-150 ease-out hover:-translate-y-0.5"
              style={{ background: C.bg, color: C.fg2, padding: '12px 22px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}` }}
            >
              Vyzkoušet generátor
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 112px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: C.muted, marginBottom: 16 }}>
            Další články
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            {related.map(r => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '16px 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none', color: C.fg }}
              >
                <span style={{ fontSize: 17, fontWeight: 500 }}>{r.title}</span>
                <span aria-hidden style={{ color: C.primary }}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
