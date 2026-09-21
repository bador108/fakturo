'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef', borderStrong: '#d4d4d8',
  primary: '#16a34a',
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={52} color="#16a34a" /></div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>Zpráva odeslána</h2>
        <p style={{ fontSize: 16, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Ozveme se ti na <strong>{form.email}</strong> co nejdříve. Obvykle do 24 hodin.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="kontakt-jmeno" style={labelStyle}>Jméno</label>
          <input
            id="kontakt-jmeno"
            name="jmeno"
            autoComplete="name"
            type="text"
            required
            placeholder="Tvoje jméno"
            style={inputStyle}
            value={form.jmeno}
            onChange={e => setForm(f => ({ ...f, jmeno: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="kontakt-email" style={labelStyle}>Email</label>
          <input
            id="kontakt-email"
            name="email"
            autoComplete="email"
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
        <label htmlFor="kontakt-predmet" style={labelStyle}>Předmět</label>
        <select
          id="kontakt-predmet"
          name="predmet"
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
        <label htmlFor="kontakt-zprava" style={labelStyle}>Zpráva</label>
        <textarea
          id="kontakt-zprava"
          name="zprava"
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
          <a href="/gdpr" style={{ color: C.primary, textDecoration: 'underline', textUnderlineOffset: 2 }}>zásad GDPR</a>.
        </label>
      </div>
      {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="transition-transform duration-150 ease-out hover:-translate-y-0.5"
        style={{
          background: C.primary, color: C.bg, padding: '13px 24px', borderRadius: 10,
          fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Odesílám…' : 'Odeslat zprávu →'}
      </button>
    </form>
  )
}
