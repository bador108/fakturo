import Link from 'next/link'
import type { Metadata } from 'next'
import { PricingSection } from '@/components/PricingSection'

export const metadata: Metadata = {
  title: 'Ceník – Fakturo',
  description: 'Jednoduché ceny bez překvapení. Free plán zdarma (15 faktur/měsíc), Start 99 Kč/měsíc, Pro 249 Kč/měsíc.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef', borderStrong: '#d4d4d8',
  primary: '#3a59ff', primaryDark: '#2a47e0', primarySoft: '#eef0ff',
  green: '#16a34a', greenSoft: '#dcfce7',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

const faqItems: [string, string][] = [
  ['Můžu kdykoliv zrušit?', 'Ano, bez výpovědní doby. Klikneš v nastavení a předplatné se zruší. Data si stáhneš v PDF i CSV.'],
  ['Přijímáte platební kartu?', 'Platíš kartou přes zabezpečenou platební bránu Stripe.'],
  ['Mohu přejít mezi plány kdykoliv?', 'Ano, upgrade nebo downgrade kdykoliv.'],
  ['Mám faktury v bezpečí?', 'Data jsou šifrovaná (TLS), databáze má row-level security a servery jsou v EU.'],
]

export default function CenikPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 72px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Ceník</div>
        <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 20px', maxWidth: 760 }}>
          Jednoduché ceny. Žádná překvapení.
        </h1>
        <p style={{ fontSize: 18, color: C.muted, margin: '0 auto', maxWidth: 480, lineHeight: 1.6 }}>
          Plať měsíčně, zruš kdykoliv. Bez závazků. Začni zdarma.
        </p>
      </section>

      <PricingSection />

      {/* FAQ */}
      <section style={{ ...cont, padding: '96px 32px', maxWidth: 880 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>FAQ</div>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', margin: 0 }}>Časté otázky</h2>
        </div>
        {faqItems.map(([q, a], i) => (
          <details key={i} style={{ borderTop: `1px solid ${C.border}`, borderBottom: i === faqItems.length - 1 ? `1px solid ${C.border}` : 'none', padding: '20px 0' }}>
            <summary style={{ fontSize: 17, fontWeight: 600, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {q}<span style={{ fontSize: 20, color: C.muted, fontWeight: 400 }}>+</span>
            </summary>
            <div style={{ fontSize: 15, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>{a}</div>
          </details>
        ))}
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{ ...cont, background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 20, padding: '64px 48px', textAlign: 'center' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px' }}>Začni ještě dnes</h2>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
            14 dní zdarma, bez kreditní karty. Zruš kdykoliv.
          </p>
          <Link href="/sign-up" style={{
            background: C.fg, color: C.bg, padding: '13px 26px', borderRadius: 10,
            fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          }}>
            Vyzkoušet zdarma →
          </Link>
        </div>
      </section>
    </div>
  )
}
