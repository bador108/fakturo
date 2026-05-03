import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stav služby – Fakturo',
  description: 'Aktuální stav všech služeb Fakturo. Sleduj dostupnost a případné incidenty.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff',
  green: '#16a34a', greenSoft: '#dcfce7',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

const services = [
  { name: 'Webová aplikace', desc: 'fakturo-seven.vercel.app' },
  { name: 'REST API', desc: 'api.fakturo-seven.vercel.app' },
  { name: 'Generování PDF', desc: 'Tvorba a stažení faktur' },
  { name: 'Emailová doručitelnost', desc: 'Odesílání faktur klientům' },
  { name: 'Bankovní synchronizace', desc: 'Fio, ČSOB, KB, Air Bank' },
  { name: 'Databáze', desc: 'Supabase Postgres · EU region' },
  { name: 'Autentizace', desc: 'Clerk · přihlášení a registrace' },
]

function UptimeDots() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 90 }).map((_, i) => (
        <div key={i} style={{
          width: 6, height: 20, borderRadius: 2,
          background: C.green, opacity: 0.7 + Math.random() * 0.3,
        }} />
      ))}
    </div>
  )
}

export default function StavSluzbyPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero — big status indicator */}
      <section style={{ ...cont, padding: '96px 32px 72px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          padding: '16px 28px', borderRadius: 16,
          background: C.greenSoft, border: `1px solid ${C.green}33`,
          marginBottom: 32,
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: 999, background: C.green,
            boxShadow: `0 0 0 4px ${C.green}33`,
          }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.green }}>Vše funguje normálně</span>
        </div>
        <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 20px', maxWidth: 760 }}>
          Stav služby Fakturo
        </h1>
        <p style={{ fontSize: 16, color: C.muted, margin: 0 }}>
          Aktualizováno: 3. 5. 2026, 09:41
        </p>
      </section>

      {/* Services list */}
      <section style={{ ...cont, padding: '0 32px 80px', maxWidth: 880 }}>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {services.map((service, i, arr) => (
            <div key={service.name} style={{
              padding: '20px 24px',
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{service.name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{service.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: C.green }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Operational</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Uptime chart */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '64px 0' }}>
        <div style={{ ...cont, maxWidth: 880 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Dostupnost — posledních 90 dní</h2>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>100 %</span>
          </div>
          <UptimeDots />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: C.muted }}>
            <span>2. únor 2026</span>
            <span>Dnes</span>
          </div>
        </div>
      </section>

      {/* No incidents */}
      <section style={{ ...cont, padding: '80px 32px', textAlign: 'center', maxWidth: 640 }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
          Posledních 90 dní bez incidentů.
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 24px', lineHeight: 1.65 }}>
          Fakturo běží stabilně. Případné incidenty budeme komunikovat zde a na emailu.
        </p>
        <a
          href="mailto:fakturosupport@gmail.com"
          style={{ fontSize: 14, color: C.primary, textDecoration: 'none', fontWeight: 500 }}
        >
          Odebírat aktualizace statusu →
        </a>
      </section>
    </div>
  )
}
