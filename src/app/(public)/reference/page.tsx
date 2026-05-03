import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reference – Fakturo',
  description: 'Co říkají freelanceři a OSVČ o Fakturo. Přečti si zkušenosti našich uživatelů.',
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

const testimonials = [
  {
    initials: 'L',
    name: 'Lenka Marková',
    role: 'Copywriterka · Brno',
    period: '14 měsíců',
    quote: 'Konečně nástroj, který nezatěžuje. Vystavím fakturu mezi dvěma e-maily, banka platby spáruje sama a já se nemusím starat. To mi vrátilo víkendy.',
  },
  {
    initials: 'P',
    name: 'Petr Holub',
    role: 'Grafik · Praha',
    period: '8 měsíců',
    quote: 'Konečně něco rychlejšího než Excel a chytřejšího než Word. Měl jsem fakturace v různých formátech, teď mám vše na jednom místě.',
  },
  {
    initials: 'T',
    name: 'Tomáš Vrba',
    role: 'Vývojář · Olomouc',
    period: '11 měsíců',
    quote: 'Pravidelné fakturace mě zachránily. Klienti dostávají faktury samy, já jen koukám na dashboard a vidím, co je zaplacené.',
  },
  {
    initials: 'M',
    name: 'Markéta Dvořáčková',
    role: 'Architektka · Brno',
    period: '6 měsíců',
    quote: 'Líbí se mi, že to neumí všechno. Umí přesně to, co potřebuju — a to rychle.',
  },
  {
    initials: 'J',
    name: 'Jan Procházka',
    role: 'Fotograf · Ostrava',
    period: '9 měsíců',
    quote: 'Integrace s bankou je killer feature. Dřív jsem hodiny kontroloval výpisy, teď vidím vše v dashboardu.',
  },
  {
    initials: 'K',
    name: 'Kateřina Nováková',
    role: 'UX designérka · Praha',
    period: '5 měsíců',
    quote: 'Estetika aplikace mi sedí. Většina fakturačních nástrojů vypadá jako z roku 2010 — Fakturo vypadá jako produkt, který chci používat.',
  },
]

function Stars() {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill={C.primary}>
          <path d="M7 1l1.8 4 4.2.6-3 3 0.7 4.4L7 11l-3.7 2 0.7-4.4-3-3 4.2-.6L7 1z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReferencePage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 72px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Reference</div>
        <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 24px', maxWidth: 760 }}>
          Důvěřuje nám přes 4 200 freelancerů a firem.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.65, color: C.muted, margin: '0 auto', maxWidth: 520 }}>
          Přečti si, co říkají ti, kteří fakturují s Fakturo každý den.
        </p>
      </section>

      {/* Stats */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '48px 0', marginBottom: 0 }}>
        <div style={{ ...cont }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { num: '4 200+', label: 'Aktivních uživatelů' },
              { num: '4.9 / 5', label: 'Průměrné hodnocení' },
              { num: '1.2M', label: 'Vystavených faktur' },
              { num: '98 %', label: 'Spokojených zákazníků' },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{
                padding: '0 24px', textAlign: 'center',
                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -2, marginBottom: 6 }}>{stat.num}</div>
                <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials grid */}
      <section style={{ ...cont, padding: '80px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ padding: 28, borderRadius: 16, border: `1px solid ${C.border}`, background: C.bg }}>
              <Stars />
              <p style={{ fontSize: 16, lineHeight: 1.65, color: C.fg2, margin: '0 0 24px' }}>
                &bdquo;{t.quote}&ldquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 999, flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.primary}, #2a47e0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.role} · {t.period}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{ ...cont, background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 20, padding: '64px 48px', textAlign: 'center' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px' }}>
            Přidej se k nim.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
            14 dní zdarma, bez kreditní karty.
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
