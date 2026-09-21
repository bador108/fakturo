import type { Metadata } from 'next'
import Link from 'next/link'
import { posts, readingMinutes, formatBlogDate } from '@/lib/blog'

const URL = 'https://fakturo.online/blog'

export const metadata: Metadata = {
  title: 'Blog o fakturaci pro OSVČ – Fakturo',
  description:
    'Praktické články o fakturaci, DPH, upomínkách a výdajích pro OSVČ a malé firmy. Srozumitelně a s příklady.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Blog o fakturaci pro OSVČ – Fakturo',
    description: 'Praktické články o fakturaci, DPH, upomínkách a výdajích pro OSVČ a malé firmy.',
    url: URL,
    type: 'website',
  },
}

const C = {
  bg: '#ffffff', fg: '#0c0c0e', fg2: '#1f1f23', muted: '#6b7280', border: '#ececef', primary: '#15803d',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }

export default function BlogIndexPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      <section style={{ ...cont, padding: '96px 32px 56px' }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Blog</div>
          <h1 style={{ fontWeight: 600, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 0 24px' }}>
            Fakturace srozumitelně
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: C.muted, margin: 0 }}>
            Krátké články o tom, jak správně fakturovat, platit daně a nenechat si zaplatit pozdě. Psané pro OSVČ a malé firmy.
          </p>
        </div>
      </section>

      <section style={{ ...cont, padding: '0 32px 112px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="transition-transform duration-200 ease-out hover:-translate-y-0.5"
              style={{
                display: 'flex', flexDirection: 'column', gap: 12, padding: 28, borderRadius: 16,
                border: `1px solid ${C.border}`, background: C.bg, textDecoration: 'none', color: C.fg,
              }}
            >
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2 }}>{post.category}</div>
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.8, lineHeight: 1.2, margin: 0 }}>{post.title}</h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, margin: 0, flex: 1 }}>{post.description}</p>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                {formatBlogDate(post.published)} · {readingMinutes(post)} min čtení
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
