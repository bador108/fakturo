import Link from 'next/link'
import type { Metadata } from 'next'
import { PRICING } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'Ceník – Fakturo',
  description: 'Jednoduché ceny bez překvapení. Free plán zdarma, Profi 199 Kč/měsíc, Business 449 Kč/měsíc.',
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

function CheckItem({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="8" cy="8" r="8" fill={muted ? C.bgSoft : C.greenSoft} />
        <path d="M5 8L7 10L11 6" stroke={muted ? C.muted : C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 14, color: muted ? C.muted : C.fg2, lineHeight: 1.55 }}>{text}</span>
    </li>
  )
}

const faqItems: [string, string][] = [
  ['Můžu kdykoliv zrušit?', 'Ano, bez výpovědní doby. Klikneš v nastavení a předplatné se zruší. Data si stáhneš v PDF i CSV.'],
  ['Co se stane po skončení zkušební doby?', 'Přejdeš automaticky na Free plán. Nic se neztratí — všechny faktury zůstanou přístupné.'],
  ['Přijímáte platební kartu?', 'Platíš kartou přes zabezpečenou platební bránu Stripe. Nebo bankovním převodem na vyžádání.'],
  ['Mohu přejít mezi plány kdykoliv?', 'Ano, upgrade nebo downgrade kdykoliv. Přechod je okamžitý, cena se poměrně přepočítá.'],
  ['Mám faktury v bezpečí?', 'Veškerá data jsou šifrovaná, zálohy denně, servery v EU. Plný soulad s GDPR.'],
]

export default function CenikPage() {
  const plans = [
    {
      key: 'free',
      name: PRICING.free.name,
      price: PRICING.free.price,
      desc: 'Pro začátek nebo občasné faktury.',
      highlight: false,
      badge: null,
      cta: 'Začít zdarma',
      ctaHref: '/sign-up',
      items: [
        '5 faktur měsíčně',
        'PDF export',
        'Databáze klientů',
        'Emailové odeslání',
        'Podpora přes email',
      ],
    },
    {
      key: 'profi',
      name: PRICING.profi.name,
      price: PRICING.profi.price,
      desc: 'Pro aktivní freelancery a OSVČ.',
      highlight: true,
      badge: 'Nejoblíbenější',
      cta: 'Vyzkoušet 14 dní zdarma',
      ctaHref: '/sign-up',
      items: [
        'Neomezené faktury',
        'Automatické párování plateb (banka)',
        'Pravidelné / opakované fakturace',
        'Upomínky a notifikace',
        'Export pro účetní (Pohoda XML)',
        'Víceměnové faktury + kurzy ČNB',
        'Prioritní podpora',
      ],
    },
    {
      key: 'business',
      name: PRICING.business.name,
      price: PRICING.business.price,
      desc: 'Pro firmy a pokročilé uživatele.',
      highlight: false,
      badge: null,
      cta: 'Vyzkoušet 14 dní zdarma',
      ctaHref: '/sign-up',
      items: [
        'Vše z Profi plánu',
        'Více odesílatelských profilů',
        'REST API + webhooky',
        'Pokročilé výkazy a přehledy',
        'EU fakturace (VIES, OSS, reverse charge)',
        'Dedikovaný account manager',
        'SLA 99,9 %',
      ],
    },
  ]

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

      {/* Pricing cards */}
      <section style={{ ...cont, padding: '0 32px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' }}>
          {plans.map(plan => (
            <div key={plan.key} style={{
              padding: 32, borderRadius: 16,
              border: plan.highlight ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
              background: plan.highlight ? C.bg : C.bg,
              position: 'relative',
              display: 'flex', flexDirection: 'column',
              boxShadow: plan.highlight ? `0 0 0 4px ${C.primarySoft}` : 'none',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: C.primary, color: C.bg,
                  padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: -2 }}>
                    {plan.price === 0 ? 'Zdarma' : `${plan.price} Kč`}
                  </span>
                  {plan.price > 0 && <span style={{ fontSize: 14, color: C.muted }}>/měsíc</span>}
                </div>
                <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.5 }}>{plan.desc}</p>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 auto', padding: 0 }}>
                {plan.items.map(item => <CheckItem key={item} text={item} />)}
              </ul>
              <Link href={plan.ctaHref} style={{
                display: 'block', textAlign: 'center', marginTop: 28,
                background: plan.highlight ? C.fg : C.bgSoft,
                color: plan.highlight ? C.bg : C.fg,
                border: plan.highlight ? 'none' : `1px solid ${C.border}`,
                padding: '12px 20px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ ...cont, padding: '0 32px 96px', maxWidth: 880 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>FAQ</div>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', margin: 0 }}>Časté otázky.</h2>
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
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px' }}>Začni ještě dnes.</h2>
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
