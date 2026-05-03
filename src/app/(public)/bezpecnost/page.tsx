import Link from 'next/link'
import type { Metadata } from 'next'
import { Lock, ShieldCheck, Server, CreditCard, Key, Bug } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bezpečnost – Fakturo',
  description: 'Jak Fakturo chrání tvoje data. Šifrování, autentizace, infrastruktura a GDPR compliance.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff', primarySoft: '#eef0ff',
  green: '#16a34a', greenSoft: '#dcfce7',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

const sectionIcons = [
  <Lock key="lock" size={22} color="#0c0c0e" />,
  <ShieldCheck key="shield" size={22} color="#0c0c0e" />,
  <Server key="server" size={22} color="#0c0c0e" />,
  <CreditCard key="card" size={22} color="#0c0c0e" />,
  <Key key="key" size={22} color="#0c0c0e" />,
  <Bug key="bug" size={22} color="#0c0c0e" />,
]

const sections = [
  {
    title: 'Šifrování',
    items: [
      'Veškerá data přenášena přes TLS 1.3',
      'Data v databázi šifrována v klidu (AES-256)',
      'PDF faktury uloženy v šifrovaném úložišti',
      'API klíče uloženy jako jednosměrný hash (bcrypt)',
    ],
  },
  {
    title: 'Autentizace',
    items: [
      'Dvoufaktorová autentizace (2FA) pro všechny účty',
      'Přihlášení přes Clerk — SOC 2 Type II certifikovaný',
      'Automatická invalidace sessions po 30 dnech nečinnosti',
      'Rate limiting přihlašovacích pokusů',
      'Audit log každé přihlášení a kritické akce',
    ],
  },
  {
    title: 'Infrastruktura',
    items: [
      'Hosting na Vercel (Edge Network) a Supabase',
      'Databázové servery výhradně v EU (Frankfurt)',
      'Denní zálohy databáze s retencí 30 dní',
      'Monitoring dostupnosti 24/7 s alertingem',
      'Penetrační testy prováděny každé čtvrtletí',
    ],
  },
  {
    title: 'Platby',
    items: [
      'Platby zpracovává Stripe — PCI DSS Level 1',
      'Fakturo nikdy nevidí čísla platebních karet',
      'Šifrované tokenizace platebních metod',
      'SCA (Strong Customer Authentication) dle PSD2',
    ],
  },
  {
    title: 'Řízení přístupu',
    items: [
      'Princip nejnižších oprávnění pro interní přístupy',
      'Row-level security (RLS) v databázi — vidíš jen svá data',
      'Interní přístupy zaměstnanců jsou auditovány',
      'Žádný zaměstnanec nemá přístup k heslům uživatelů',
    ],
  },
  {
    title: 'Bug bounty',
    items: [
      'Zodpovědné hlášení bezpečnostních zranitelností vítáme',
      'Email: security@fakturo.cz',
      'Odpovídáme do 48 hodin od nahlášení',
      'Závažné nálezy jsou odměňovány kreditem nebo peněžní odměnou',
    ],
  },
]

export default function BezpecnostPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 80px' }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Bezpečnost</div>
          <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 0 24px' }}>
            Tvoje data jsou v bezpečí.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: C.muted, margin: '0 0 20px', maxWidth: 580 }}>
            Bezpečnost je pro nás základní požadavek, ne doplněk. Fakturuješ s důvěrnými obchodními daty — bereme to vážně.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['TLS 1.3', 'AES-256', 'SOC 2 Type II (Clerk)', 'GDPR', 'PCI DSS (Stripe)'].map(badge => (
              <span key={badge} style={{
                padding: '6px 12px', borderRadius: 999, background: C.greenSoft,
                color: C.green, fontSize: 12, fontWeight: 600, border: `1px solid ${C.green}33`,
              }}>
                ✓ {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sections grid */}
      <section style={{ ...cont, padding: '0 32px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {sections.map((section, idx) => (
            <div key={section.title} style={{ padding: 32, borderRadius: 16, border: `1px solid ${C.border}`, background: C.bg }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: C.bgSoft,
                border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 20,
              }}>
                {sectionIcons[idx]}
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 16px', letterSpacing: -0.4 }}>{section.title}</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {section.items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="8" cy="8" r="8" fill={C.greenSoft} />
                      <path d="M5 8L7 10L11 6" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 14, color: C.fg2, lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Contact security */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, padding: '64px 0' }}>
        <div style={{ ...cont, textAlign: 'center' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', margin: '0 0 16px', letterSpacing: -1.5 }}>
            Našel jsi bezpečnostní problém?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 0 24px', lineHeight: 1.6 }}>
            Nahlašuj zodpovědně na{' '}
            <a href="mailto:security@fakturo.cz" style={{ color: C.primary, textDecoration: 'none', fontWeight: 500 }}>
              security@fakturo.cz
            </a>.
            Odměňujeme závažné nálezy.
          </p>
          <Link href="/kontakt" style={{
            background: C.fg, color: C.bg, padding: '12px 24px', borderRadius: 10,
            fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          }}>
            Kontaktovat nás →
          </Link>
        </div>
      </section>
    </div>
  )
}
