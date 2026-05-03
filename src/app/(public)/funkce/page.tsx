import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Funkce – Fakturo',
  description: 'Vše, co potřebuješ pro profesionální fakturaci. Faktury za 30 sekund, automatické párování plateb, opakované fakturace a export pro účetní.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280', muted2: '#9ca3af',
  border: '#ececef', borderStrong: '#d4d4d8',
  primary: '#3a59ff', primarySoft: '#eef0ff',
  green: '#16a34a', greenSoft: '#dcfce7',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

function CheckItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="8" cy="8" r="8" fill={C.greenSoft} />
        <path d="M5 8L7 10L11 6" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 15, color: C.fg2, lineHeight: 1.55 }}>{text}</span>
    </li>
  )
}

const features = [
  {
    icon: '⚡',
    title: 'Vystavování faktur',
    desc: 'Faktura za 30 sekund — žádné zbytečné klikání.',
    items: [
      'Automatické vyplnění z ARES podle IČO',
      'Autocomplete klientů a položek z databáze',
      'Šablony pro opakované typy faktur',
      'Výpočet DPH (0 %, 15 %, 21 %) automaticky',
      'Víceměnové faktury — CZK, EUR, USD s kurzy ČNB',
      'PDF ke stažení nebo odeslání přímo z aplikace',
      'QR platba přímo na faktuře',
    ],
  },
  {
    icon: '👥',
    title: 'Klienti a databáze',
    desc: 'Vše o klientovi na jednom místě.',
    items: [
      'Centrální adresář klientů',
      'Automatické předvyplnění z IČO přes ARES',
      'Historie faktur per klient',
      'Označení preferované měny a splatnosti',
      'Import a export klientů v CSV',
    ],
  },
  {
    icon: '🏦',
    title: 'Sledování plateb',
    desc: 'Víš, co je zaplacené a co čeká — bez Excelu.',
    items: [
      'Napojení na Fio, ČSOB, KB a Air Bank',
      'Automatické párování plateb s fakturami přes VS',
      'Upomínky — první, druhá, třetí. Tón si nastavíš.',
      'Přehledný dashboard — zaplaceno, čeká, po splatnosti',
      'Export výpisů do PDF a CSV',
    ],
  },
  {
    icon: '📊',
    title: 'Pro účetní',
    desc: 'Předej podklady účetní jedním kliknutím.',
    items: [
      'Měsíční balíček faktur v PDF i ZIP',
      'Export do Pohoda XML formátu',
      'Přehled příjmů po měsících',
      'Podpora plátce i neplátce DPH',
      'OSS, reverse charge, VIES validace',
    ],
  },
  {
    icon: '📱',
    title: 'Mobilní přístup',
    desc: 'Fakturuj odkudkoliv — i z telefonu.',
    items: [
      'Responzivní webová aplikace bez instalace',
      'Vystav fakturu z mobilu za méně než minutu',
      'Notifikace při přijetí platby',
      'Funkční na iOS i Androidu',
    ],
  },
  {
    icon: '🔌',
    title: 'API a integrace',
    desc: 'Napoj Fakturo na vlastní systémy.',
    items: [
      'REST API pro vývojáře',
      'Webhooky při vytvoření / zaplacení faktury',
      'Napojení na e-shopy a CRM systémy',
      'Dokumentace a sandbox prostředí',
    ],
  },
]

export default function FunkcePage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 80px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Funkce</div>
        <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 24px', maxWidth: 860 }}>
          Vše, co potřebuješ pro fakturaci. Nic navíc.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: C.muted, margin: '0 auto 40px', maxWidth: 560 }}>
          Fakturo je postavené tak, abys vystavil fakturu za 30 sekund — ne za 30 minut.
        </p>
        <Link href="/sign-up" style={{
          background: C.fg, color: C.bg, padding: '14px 28px', borderRadius: 10,
          fontSize: 15, fontWeight: 600, textDecoration: 'none',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.08)',
          display: 'inline-block',
        }}>
          Vyzkoušet zdarma →
        </Link>
      </section>

      {/* Feature grid */}
      <section style={{ ...cont, padding: '0 32px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          {features.map(f => (
            <div key={f.title} style={{
              padding: 32, borderRadius: 16,
              border: `1px solid ${C.border}`, background: C.bg,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.bgSoft, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, marginBottom: 20,
              }}>
                {f.icon}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.4 }}>{f.title}</h2>
              <p style={{ fontSize: 14, color: C.muted, margin: '0 0 20px', lineHeight: 1.5 }}>{f.desc}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {f.items.map(item => <CheckItem key={item} text={item} />)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{
          ...cont,
          background: C.bgSoft, border: `1px solid ${C.border}`,
          borderRadius: 20, padding: '64px 48px', textAlign: 'center',
        }}>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px', letterSpacing: -1.5 }}>
            Začni zdarma.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
            Žádná platební karta, registrace za minutu.
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
