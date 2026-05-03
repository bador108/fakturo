'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef', borderStrong: '#d4d4d8',
  primary: '#3a59ff',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 8,
  border: `1px solid ${C.borderStrong}`, background: C.bg,
  fontSize: 15, color: C.fg, outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: C.fg2, marginBottom: 6,
}

export function ContactForm() {
  const [form, setForm] = useState({
    jmeno: '', email: '', predmet: '', zprava: '', souhlas: false,
  })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={52} color="#16a34a" /></div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>Zpráva odeslána!</h2>
        <p style={{ fontSize: 16, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Ozveme se ti na <strong>{form.email}</strong> co nejdříve. Obvykle do 24 hodin.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Jméno</label>
          <input
            type="text"
            required
            placeholder="Tvoje jméno"
            style={inputStyle}
            value={form.jmeno}
            onChange={e => setForm(f => ({ ...f, jmeno: e.target.value }))}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            required
            placeholder="tvuj@email.cz"
            style={inputStyle}
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Předmět</label>
        <select
          required
          style={{ ...inputStyle, appearance: 'none' as const, cursor: 'pointer' }}
          value={form.predmet}
          onChange={e => setForm(f => ({ ...f, predmet: e.target.value }))}
        >
          <option value="">Vyber předmět…</option>
          <option value="dotaz">Dotaz k produktu</option>
          <option value="technicka-podpora">Technická podpora</option>
          <option value="fakturace-platba">Fakturace a platba</option>
          <option value="spoluprace">Spolupráce</option>
          <option value="jine">Jiné</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Zpráva</label>
        <textarea
          required
          rows={5}
          placeholder="Napiš nám cokoliv…"
          style={{ ...inputStyle, resize: 'vertical' as const }}
          value={form.zprava}
          onChange={e => setForm(f => ({ ...f, zprava: e.target.value }))}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <input
          type="checkbox"
          id="souhlas"
          required
          style={{ marginTop: 2, flexShrink: 0 }}
          checked={form.souhlas}
          onChange={e => setForm(f => ({ ...f, souhlas: e.target.checked }))}
        />
        <label htmlFor="souhlas" style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, cursor: 'pointer' }}>
          Souhlasím se zpracováním osobních údajů dle{' '}
          <a href="/gdpr" style={{ color: C.primary, textDecoration: 'none' }}>zásad GDPR</a>.
        </label>
      </div>
      <button
        type="submit"
        style={{
          background: C.fg, color: C.bg, padding: '13px 24px', borderRadius: 10,
          fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
        }}
      >
        Odeslat zprávu →
      </button>
    </form>
  )
}
