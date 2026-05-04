import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronRight, Mail } from 'lucide-react'

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff', primarySoft: '#eef0ff',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

// Kategorie a jejich popis — pro breadcrumb
const CATEGORY_TITLES: Record<string, string> = {
  zaciname: 'Začínáme',
  faktury: 'Faktury',
  klienti: 'Klienti',
  'platby-a-banka': 'Platby a banka',
  'pravidelne-fakturace': 'Pravidelné fakturace',
  'ucetni-export': 'Účetní export',
  'predplatne-a-cenik': 'Předplatné a ceník',
  'bezpecnost-a-gdpr': 'Bezpečnost a GDPR',
}

function slugToTitle(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

type Props = { params: Promise<{ category: string; article: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article } = await params
  return {
    title: `${slugToTitle(article)} – Nápověda – Fakturo`,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { category, article } = await params
  const categoryTitle = CATEGORY_TITLES[category]
  if (!categoryTitle) notFound()

  return (
    <div style={{ background: C.bg, color: C.fg, minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <section style={{ background: C.bgSoft, borderBottom: `1px solid ${C.border}`, padding: '48px 32px 40px' }}>
        <div style={cont}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted, marginBottom: 24, flexWrap: 'wrap' }}>
            <Link href="/napoveda" style={{ color: C.muted, textDecoration: 'none' }}>Nápověda</Link>
            <ChevronRight size={14} />
            <Link href={`/napoveda/${category}`} style={{ color: C.muted, textDecoration: 'none' }}>{categoryTitle}</Link>
            <ChevronRight size={14} />
            <span style={{ color: C.fg }}>{slugToTitle(article)}</span>
          </div>
          <h1 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: 0, letterSpacing: -1.5 }}>
            {slugToTitle(article)}
          </h1>
        </div>
      </section>

      {/* Content placeholder */}
      <section style={{ ...cont, padding: '64px 32px' }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{
            padding: '32px 36px', borderRadius: 16, border: `1px solid ${C.border}`,
            background: C.bgSoft, textAlign: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: C.primarySoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Mail size={24} color={C.primary} />
            </div>
            <h2 style={{ ...disp, fontSize: '1.4rem', margin: '0 0 12px', letterSpacing: -1 }}>
              Článek se připravuje
            </h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 28px' }}>
              Tento článek nápovědy ještě dokončujeme. Pokud potřebuješ pomoc hned,
              napiš nám — odpovíme do 24 hodin.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/kontakt" style={{
                background: C.fg, color: C.bg, padding: '11px 22px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Napsat nám →
              </Link>
              <Link href={`/napoveda/${category}`} style={{
                background: C.bg, color: C.fg2, padding: '11px 22px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                border: `1px solid ${C.border}`,
              }}>
                ← Zpět na {categoryTitle}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
