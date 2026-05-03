import type { Metadata } from 'next'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt – Fakturo',
  description: 'Napiš nám. Rádi odpovíme na dotazy, zpětnou vazbu nebo technické problémy.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

export default function KontaktPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 80px' }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Kontakt</div>
          <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 0 24px' }}>
            Ozvi se nám.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: C.muted, margin: 0 }}>
            Máš otázku, zpětnou vazbu nebo narazil jsi na problém? Ozveme se co nejdřív.
          </p>
        </div>
      </section>

      <section style={{ ...cont, padding: '0 32px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'start' }}>
          {/* Contact info */}
          <div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, color: C.muted }}>Email</div>
              <a href="mailto:fakturosupport@gmail.com" style={{ fontSize: 16, color: C.primary, textDecoration: 'none', fontWeight: 500 }}>
                fakturosupport@gmail.com
              </a>
            </div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, color: C.muted }}>Obvyklá reakce</div>
              <div style={{ fontSize: 15, color: C.fg2, lineHeight: 1.6 }}>Do 24 hodin v pracovní dny.</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, color: C.muted }}>Sídlo</div>
              <div style={{ fontSize: 15, color: C.fg2, lineHeight: 1.7 }}>
                Fakturo<br />
                Česká republika
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: 40, borderRadius: 16, border: `1px solid ${C.border}`, background: C.bg }}>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
