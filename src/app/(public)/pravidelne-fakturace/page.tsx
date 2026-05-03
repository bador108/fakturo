import Link from 'next/link'
import type { Metadata } from 'next'
import { Code2, Palette, PenLine, Camera } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pravidelné fakturace – Fakturo',
  description: 'Vystav fakturu jednou. Posílej ji každý měsíc automaticky. Ideální pro retainery, předplatné a opakované zakázky.',
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

const steps = [
  {
    num: '01',
    title: 'Nastav šablonu faktury',
    text: 'Vyber klienta, vyplň položky a nastav částku. Stačí jednou.',
  },
  {
    num: '02',
    title: 'Zvol frekvenci a datum',
    text: 'Měsíčně, čtvrtletně nebo ročně. Faktura odejde přesně ve zvolený den.',
  },
  {
    num: '03',
    title: 'Fakturo se postará o zbytek',
    text: 'Faktura se vystaví, odešle klientovi a čeká na zaplacení. Ty jen kontroluješ přehled.',
  },
]

const capabilities = [
  'Opakování měsíčně, čtvrtletně nebo ročně',
  'Automatické odeslání faktury emailem',
  'Párování plateb s bankovním výpisem',
  'Upomínky při nezaplacení',
  'Podpora CZK, EUR a USD',
  'EU fakturace s VIES validací',
  'Pause nebo zrušení kdykoliv jedním kliknutím',
]

export default function PravidelneFacturacePage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: '#fef3c7', border: '1px solid #fde68a', fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 24 }}>
          ⏳ Coming soon — přidej se na waitlist
        </div>
        <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 24px', maxWidth: 860 }}>
          Vystav fakturu jednou. Posílej ji každý měsíc automaticky.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: C.muted, margin: '0 auto 40px', maxWidth: 560 }}>
          Ideální pro retainery, předplatné a opakované zakázky. Jednou nastavíš, pak se staráš o práci — ne o papírování.
        </p>
        <Link href="/sign-up" style={{
          background: C.fg, color: C.bg, padding: '14px 28px', borderRadius: 10,
          fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.08)',
        }}>
          Připojit se na waitlist
        </Link>
      </section>

      {/* Pro koho */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 0' }}>
        <div style={{ ...cont, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Pro koho</div>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', margin: '0 auto 48px', maxWidth: 640, letterSpacing: -1.5 }}>
            Kdo z toho nejvíc získá?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
            {[
              { icon: <Code2 size={24} color={C.fg} />, label: 'Vývojáři', desc: 'Měsíční retainery a maintenance' },
              { icon: <Palette size={24} color={C.fg} />, label: 'Designéři', desc: 'Opakované projekty a brandové smlouvy' },
              { icon: <PenLine size={24} color={C.fg} />, label: 'Copywriteři', desc: 'Pravidelné obsahové zakázky' },
              { icon: <Camera size={24} color={C.fg} />, label: 'Fotografové', desc: 'Roční smlouvy a předplatné' },
            ].map(item => (
              <div key={item.label} style={{ padding: 28, borderRadius: 14, background: C.bg, border: `1px solid ${C.border}` }}>
                <div style={{ marginBottom: 14 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...cont, padding: '96px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Jak to funguje</div>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', margin: 0, letterSpacing: -1.5 }}>Tři kroky, pak klid</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
          {steps.map(step => (
            <div key={step.num} style={{ padding: 32, borderRadius: 16, border: `1px solid ${C.border}`, background: C.bg }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Krok {step.num}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px', letterSpacing: -0.4 }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.6 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 0' }}>
        <div style={{ ...cont }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Co umí</div>
              <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 32px', letterSpacing: -1.5 }}>Pravidelné fakturace v Fakturo</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {capabilities.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill={C.greenSoft} />
                      <path d="M5 8L7 10L11 6" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 15, color: C.fg2, lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: 32, borderRadius: 16, background: C.bg, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Příklad</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Měsíční retainer · Studio Pixel</div>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>20 000 Kč · každý 28. v měsíci</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { date: '28. dub 2026', status: 'Zaplaceno', paid: true },
                  { date: '28. bře 2026', status: 'Zaplaceno', paid: true },
                  { date: '28. kvě 2026', status: 'Naplánováno', paid: false },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{row.date}</span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: row.paid ? C.greenSoft : C.bgSoft,
                      color: row.paid ? C.green : C.muted,
                      border: row.paid ? 'none' : `1px dashed ${C.border}`,
                    }}>
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 32px' }}>
        <div style={{ ...cont, background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 20, padding: '64px 48px', textAlign: 'center' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px' }}>
            Chceš být první, kdo to vyzkouší?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
            Funkce je ve vývoji. Přidej se na waitlist a dáme ti vědět jako prvním.
          </p>
          <Link href="/sign-up" style={{
            background: C.fg, color: C.bg, padding: '13px 26px', borderRadius: 10,
            fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          }}>
            Připojit se na waitlist →
          </Link>
        </div>
      </section>
    </div>
  )
}
