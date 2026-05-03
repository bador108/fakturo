import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API pro vývojáře – Fakturo',
  description: 'Fakturo REST API. Integruj fakturaci do svého produktu, e-shopu nebo interního systému.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa', bgDark: '#0c0c0e',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280', muted2: '#9ca3af',
  border: '#ececef',
  primary: '#3a59ff', primarySoft: '#eef0ff',
  green: '#16a34a', greenSoft: '#dcfce7',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

const capabilities = [
  'Vytvářet, číst, aktualizovat a mazat faktury',
  'Spravovat databázi klientů',
  'Generovat PDF faktury on-demand',
  'Přijímat webhooky při zaplacení nebo vystavení',
  'Odesílat faktury emailem programaticky',
  'Sledovat stav plateb v reálném čase',
]

const techSpecs = [
  { label: 'Protokol', value: 'REST / HTTPS' },
  { label: 'Formát', value: 'JSON' },
  { label: 'Autentizace', value: 'Bearer token (API key)' },
  { label: 'Rate limit', value: '1 000 req / hodinu' },
  { label: 'Sandbox', value: 'Ano — testovací prostředí zdarma' },
  { label: 'Webhooky', value: 'invoice.created · invoice.paid · invoice.overdue' },
]

const codeSnippet = `curl -X POST https://api.fakturo-seven.vercel.app/v1/invoices \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "clt_abc123",
    "items": [{ "name": "Konzultace", "quantity": 5, "price": 1500 }],
    "due_date": "2026-05-15"
  }'`

export default function ApiDevelopersPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: C.primarySoft, border: `1px solid ${C.primary}33`, fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 24 }}>
          🔌 REST API · v1
        </div>
        <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 24px', maxWidth: 820 }}>
          Fakturo API. Pro vývojáře, kteří potřebují víc.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: C.muted, margin: '0 auto 40px', maxWidth: 560 }}>
          Integruj fakturaci přímo do svého produktu, e-shopu nebo interního systému. Jednoduché REST API s dokumentací.
        </p>
        <Link href="/sign-up" style={{
          background: C.fg, color: C.bg, padding: '14px 28px', borderRadius: 10,
          fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.08)',
        }}>
          Připojit se na waitlist
        </Link>
      </section>

      {/* Code example */}
      <section style={{ background: C.bgDark, padding: '80px 0' }}>
        <div style={{ ...cont }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Příklad</div>
              <h2 style={{ ...disp, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', margin: '0 0 16px', color: '#f0f0f0', letterSpacing: -1.5 }}>
                Faktura jedním API voláním.
              </h2>
              <p style={{ fontSize: 15, color: '#8c8c8c', lineHeight: 1.6, margin: 0 }}>
                POST na <code style={{ color: C.primary, fontFamily: 'monospace', fontSize: 14 }}>/v1/invoices</code> vrátí fakturu i s PDF linkem — okamžitě.
              </p>
            </div>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ background: '#141414', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(bg => <div key={bg} style={{ width: 10, height: 10, borderRadius: 999, background: bg }} />)}
                <span style={{ fontSize: 12, color: '#6b6b6b', marginLeft: 8, fontFamily: 'monospace' }}>Terminal</span>
              </div>
              <pre style={{
                margin: 0, padding: '24px 20px',
                background: '#1a1a1a',
                fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontSize: 12, lineHeight: 1.7,
                color: '#e0e0e0',
                overflowX: 'auto',
              }}>
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* What API does */}
      <section style={{ ...cont, padding: '96px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Možnosti</div>
            <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 32px', letterSpacing: -1.5 }}>Co přes API umíš.</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {capabilities.map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="8" fill={C.greenSoft} />
                    <path d="M5 8L7 10L11 6" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 15, color: C.fg2, lineHeight: 1.55 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Tech specs</div>
            <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 32px', letterSpacing: -1.5 }}>Technické parametry.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {techSpecs.map((spec, i) => (
                <div key={spec.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i < techSpecs.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{spec.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For whom */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 0' }}>
        <div style={{ ...cont, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Pro koho</div>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', margin: '0 auto 48px', maxWidth: 600, letterSpacing: -1.5 }}>
            Kdo API využije.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
            {[
              { icon: '🛒', label: 'E-shopy', desc: 'Automatická faktura po každé objednávce' },
              { icon: '🏢', label: 'SaaS firmy', desc: 'Fakturace předplatného bez ručního vystavování' },
              { icon: '🔧', label: 'Interní nástroje', desc: 'Propojení s ERP nebo CRM systémem' },
              { icon: '🤝', label: 'Agentury', desc: 'Hromadné vystavování pro portfolio klientů' },
            ].map(item => (
              <div key={item.label} style={{ padding: 28, borderRadius: 14, background: C.bg, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 32px' }}>
        <div style={{ ...cont, background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 20, padding: '64px 48px', textAlign: 'center' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px' }}>API je ve vývoji.</h2>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
            Přidej se na waitlist. Dáme ti vědět jako prvním a dostaneš early access.
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
