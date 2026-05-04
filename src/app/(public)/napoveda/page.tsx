import Link from 'next/link'
import type { Metadata } from 'next'
import { Rocket, FileText, Users, Building2, RefreshCw, BarChart2, CreditCard, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nápověda – Fakturo',
  description: 'Centrum nápovědy Fakturo. Průvodce, návody a odpovědi na nejčastější otázky.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef', borderStrong: '#d4d4d8',
  primary: '#3a59ff', primarySoft: '#eef0ff',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

const fg = '#0c0c0e'
const categories = [
  { icon: <Rocket size={22} color={fg} />, title: 'Začínáme', desc: 'Jak nastavit účet a vystavit první fakturu', articles: 8, slug: 'zaciname' },
  { icon: <FileText size={22} color={fg} />, title: 'Faktury', desc: 'Vystavení, úprava, odeslání a stornování', articles: 12, slug: 'faktury' },
  { icon: <Users size={22} color={fg} />, title: 'Klienti', desc: 'Správa klientů a firemní databáze', articles: 6, slug: 'klienti' },
  { icon: <Building2 size={22} color={fg} />, title: 'Platby a banka', desc: 'Napojení na banku a párování plateb', articles: 9, slug: 'platby-a-banka' },
  { icon: <RefreshCw size={22} color={fg} />, title: 'Pravidelné fakturace', desc: 'Nastavení opakovaných faktur', articles: 5, slug: 'pravidelne-fakturace' },
  { icon: <BarChart2 size={22} color={fg} />, title: 'Účetní export', desc: 'Pohoda XML, PDF, CSV a měsíční podklady', articles: 7, slug: 'ucetni-export' },
  { icon: <CreditCard size={22} color={fg} />, title: 'Předplatné a ceník', desc: 'Plány, platby a správa předplatného', articles: 4, slug: 'predplatne-a-cenik' },
  { icon: <Lock size={22} color={fg} />, title: 'Bezpečnost a GDPR', desc: 'Ochrana dat a nastavení bezpečnosti', articles: 5, slug: 'bezpecnost-a-gdpr' },
]

const popularArticles = [
  { title: 'Jak vystavit první fakturu', slug: 'jak-vystavit-prvni-fakturu', category: 'zaciname' },
  { title: 'Napojení na Fio banku', slug: 'napojeni-na-fio-banku', category: 'platby-a-banka' },
  { title: 'Co musí faktura obsahovat', slug: 'co-musi-faktura-obsahovat', category: 'faktury' },
  { title: 'Jak nastavit pravidelnou fakturaci', slug: 'jak-nastavit-pravidelnou-fakturaci', category: 'pravidelne-fakturace' },
  { title: 'Export pro účetní — Pohoda XML', slug: 'export-pro-ucetni-pohoda-xml', category: 'ucetni-export' },
  { title: 'Jak změnit nebo zrušit předplatné', slug: 'jak-zmenit-nebo-zrusit-predplatne', category: 'predplatne-a-cenik' },
]

export default function NapovedaPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero with search */}
      <section style={{ background: C.bgSoft, borderBottom: `1px solid ${C.border}`, padding: '80px 32px 64px' }}>
        <div style={{ ...cont, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Nápověda</div>
          <h1 style={{ ...disp, fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.05, letterSpacing: -2.5, margin: '0 auto 24px', maxWidth: 640 }}>
            Jak ti můžeme pomoct?
          </h1>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Hledat v nápovědě…"
                style={{
                  width: '100%', padding: '16px 20px 16px 48px', borderRadius: 12,
                  border: `1px solid ${C.borderStrong}`, background: C.bg,
                  fontSize: 16, color: C.fg, outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              />
              <div style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                color: C.muted, display: 'flex', alignItems: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 12 }}>
              Populární: {popularArticles.slice(0, 3).map((a, i) => (
                <span key={a.slug}>
                  <Link href={`/napoveda/${a.category}/${a.slug}`} style={{ color: C.primary, textDecoration: 'none' }}>{a.title}</Link>
                  {i < 2 && <span style={{ margin: '0 6px' }}>·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ ...cont, padding: '80px 32px' }}>
        <h2 style={{ ...disp, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', margin: '0 0 32px', letterSpacing: -1 }}>Procházet kategorie</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {categories.map(cat => (
            <Link key={cat.title} href={`/napoveda/${cat.slug}`} style={{
              padding: 24, borderRadius: 14, border: `1px solid ${C.border}`,
              background: C.bg, display: 'flex', alignItems: 'flex-start', gap: 16,
              textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: C.bgSoft,
                border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                {cat.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{cat.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>{cat.desc}</div>
                <div style={{ fontSize: 12, color: C.primary, fontWeight: 500 }}>{cat.articles} článků →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular articles */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '64px 0' }}>
        <div style={{ ...cont }}>
          <h2 style={{ ...disp, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', margin: '0 0 28px', letterSpacing: -1 }}>Nejčastěji hledané</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 640 }}>
            {popularArticles.map((article, i, arr) => (
              <Link key={article.slug} href={`/napoveda/${article.category}/${article.slug}`} style={{
                padding: '16px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: 15, color: C.fg2, fontWeight: 500 }}>{article.title}</span>
                <span style={{ color: C.muted, fontSize: 16 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ ...cont, padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ ...disp, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', margin: '0 0 16px', letterSpacing: -1.5 }}>
          Nenašel jsi odpověď?
        </h2>
        <p style={{ fontSize: 16, color: C.muted, margin: '0 0 28px', lineHeight: 1.6 }}>
          Náš tým ti odpoví do 24 hodin.
        </p>
        <Link href="/kontakt" style={{
          background: C.fg, color: C.bg, padding: '12px 24px', borderRadius: 10,
          fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
        }}>
          Napsat nám →
        </Link>
      </section>
    </div>
  )
}
