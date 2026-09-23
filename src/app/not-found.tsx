import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/layout/SiteNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

export const metadata: Metadata = {
  title: 'Stránka nenalezena – Fakturo',
  robots: { index: false, follow: false },
}

const C = {
  bg: '#ffffff', fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280', border: '#ececef', primary: '#15803d',
}

const quickLinks: [string, string][] = [
  ['/funkce', 'Funkce'],
  ['/cenik', 'Ceník'],
  ['/pravidelne-fakturace', 'Pravidelné fakturace'],
  ['/kontakt', 'Kontakt'],
]

export default function NotFound() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'var(--font-dm-sans), -apple-system, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' as const, color: C.fg }}>
      <SiteNav />
      <main style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background:
              'radial-gradient(700px 480px at 15% 10%, rgba(22,163,74,0.10), transparent 62%), radial-gradient(640px 440px at 92% 20%, rgba(234,179,8,0.08), transparent 60%)',
          }}
        />
        <section style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '88px 32px 120px' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>
              Chyba 404
            </div>
            <div
              aria-hidden
              style={{
                fontSize: 'clamp(6rem, 18vw, 13rem)', lineHeight: 0.9, fontWeight: 700,
                letterSpacing: -8, color: C.primary, marginBottom: 12,
              }}
            >
              404
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 600, lineHeight: 1.05, letterSpacing: -2, margin: '0 0 20px' }}>
              Tady žádná faktura není
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: C.muted, margin: '0 0 36px' }}>
              Stránka, kterou hledáš, neexistuje nebo se přestěhovala. Zkontroluj adresu, nebo se vrať tam, kde to znáš.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 56 }}>
              <Link
                href="/"
                className="transition-transform duration-150 ease-out hover:-translate-y-0.5"
                style={{
                  background: C.primary, color: C.bg, padding: '13px 22px', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, textDecoration: 'none',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                Zpět na hlavní stránku
              </Link>
              <Link
                href="/dashboard"
                className="transition-transform duration-150 ease-out hover:-translate-y-0.5"
                style={{
                  background: C.bg, color: C.fg2, padding: '12px 22px', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}`,
                }}
              >
                Do aplikace
              </Link>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: C.muted, marginBottom: 14 }}>
                Možná hledáš
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
                {quickLinks.map(([href, label]) => (
                  <Link key={href} href={href} style={{ fontSize: 15, color: C.fg2, fontWeight: 500, textDecoration: 'none' }}>
                    {label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
