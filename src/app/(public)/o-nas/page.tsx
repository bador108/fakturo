import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O nás – Fakturo',
  description: 'Fakturo je moderní fakturační nástroj pro českou realitu. Stavíme fakturaci pro lidi, kteří dělají skutečnou práci.',
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

const principles = [
  {
    icon: '⚡',
    title: 'Rychlost nade vše',
    text: 'Každá sekunda navíc strávená v aplikaci je sekunda, která tě odvádí od skutečné práce. Proto je naším cílem faktura za 30 sekund.',
  },
  {
    icon: '✂️',
    title: 'Méně je víc',
    text: 'Nepřidáváme funkce jen proto, abychom měli co ukázat. Přidáváme je, protože řeší skutečné problémy skutečných lidí.',
  },
  {
    icon: '🇨🇿',
    title: 'Česká realita',
    text: 'IČO, DIČ, DPH, OSVČ — Czech first. Nejedná se o port zahraniční aplikace, ale o produkt postavený pro českou legislativu.',
  },
  {
    icon: '🔒',
    title: 'Tvoje data patří tobě',
    text: 'Žádný vendor lock-in. Export kdykoliv, v otevřených formátech. Data máš vždy pod kontrolou.',
  },
]

export default function ONasPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 80px' }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>O nás</div>
          <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 0 28px' }}>
            Fakturace, jak má vypadat v roce 2026.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.65, color: C.muted, margin: '0 0 20px', maxWidth: 620 }}>
            Fakturo vzniklo ze frustrace. Existující fakturační nástroje jsou buď příliš složité, příliš drahé, nebo příliš ošklivé. My věříme, že to jde lépe.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: C.muted, margin: 0, maxWidth: 620 }}>
            Stavíme produkt pro českou realitu — OSVČ, freelancery a malé firmy, kteří chtějí strávit co nejméně času papírováním a co nejvíce času prací, která je baví.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '56px 0' }}>
        <div style={{ ...cont }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { num: '2024', label: 'Rok vzniku' },
              { num: '4 200+', label: 'Aktivních uživatelů' },
              { num: '1.2M', label: 'Vystavených faktur' },
              { num: '32 s', label: 'Průměrný čas vystavení' },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{
                padding: '0 32px',
                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -2, marginBottom: 6 }}>{stat.num}</div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section style={{ ...cont, padding: '96px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Naše hodnoty</div>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', margin: 0, letterSpacing: -1.5 }}>Čtyři principy, kterými se řídíme.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {principles.map(p => (
            <div key={p.title} style={{ padding: 32, borderRadius: 16, border: `1px solid ${C.border}`, background: C.bg }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', letterSpacing: -0.3 }}>{p.title}</h3>
              <p style={{ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.65 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 0' }}>
        <div style={{ ...cont }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Tým</div>
            <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', margin: 0, letterSpacing: -1.5 }}>Kdo za tím stojí.</h2>
          </div>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={{ padding: 32, borderRadius: 16, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999, flexShrink: 0,
                background: `linear-gradient(135deg, ${C.primary}, #2a47e0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', fontSize: 24, fontWeight: 700,
              }}>
                V
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Václav Urbanec</div>
                <div style={{ fontSize: 14, color: C.primary, fontWeight: 500, marginBottom: 12 }}>Zakladatel & vývojář</div>
                <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.65 }}>
                  Student informatiky a full-stack vývojář. Fakturo stavím proto, že jsem sám potřeboval jednoduché řešení pro fakturaci jako freelancer. Věřím, že software má být rychlý, přehledný a dělat přesně to, co má.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ ...cont, padding: '96px 32px', textAlign: 'center' }}>
        <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px', letterSpacing: -1.5 }}>Chceš se ozvat?</h2>
        <p style={{ fontSize: 16, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
          Máš nápad, zpětnou vazbu nebo chceš spolupracovat? Rádi se ozveme.
        </p>
        <Link href="/kontakt" style={{
          background: C.fg, color: C.bg, padding: '13px 26px', borderRadius: 10,
          fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
        }}>
          Napsat nám →
        </Link>
      </section>
    </div>
  )
}
