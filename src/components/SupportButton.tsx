'use client'

import { useState } from 'react'
import { HelpCircle, X, Mail, Lightbulb, MessageSquare, Send, ChevronLeft } from 'lucide-react'

type ContactType = 'support' | 'idea' | 'feedback'

const TYPE_META: Record<ContactType, { label: string; icon: React.ReactNode; defaultSubject: string; placeholder: string }> = {
  support: {
    label: 'Napsat podporu',
    icon: <Mail className="h-4 w-4 text-indigo-600" />,
    defaultSubject: '',
    placeholder: 'Popište váš problém co nejpodrobněji...',
  },
  idea: {
    label: 'Navrhnout zlepšení',
    icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
    defaultSubject: 'Nápad na zlepšení Fakturo',
    placeholder: 'Popište váš nápad...',
  },
  feedback: {
    label: 'Zpětná vazba',
    icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
    defaultSubject: 'Zpětná vazba',
    placeholder: 'Řekněte nám, co si myslíte...',
  },
}

export function SupportButton() {
  const [open, setOpen] = useState(false)
  const [contactType, setContactType] = useState<ContactType | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function openForm(type: ContactType) {
    setContactType(type)
    setSubject(TYPE_META[type].defaultSubject)
    setMessage('')
    setSent(false)
    setError('')
  }

  function closeAll() {
    setOpen(false)
    setContactType(null)
    setSent(false)
    setError('')
  }

  function backToMenu() {
    setContactType(null)
    setSent(false)
    setError('')
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setError('Vyplňte předmět i zprávu.')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, type: contactType }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Nepodařilo se odeslat zprávu.')
      }
      setSent(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se odeslat zprávu.')
    } finally {
      setSending(false)
    }
  }

  const meta = contactType ? TYPE_META[contactType] : null

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {open && (
        <div className="absolute bottom-14 right-0 w-[calc(100vw-3rem)] max-w-72 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden mb-2">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            {contactType ? (
              <button onClick={backToMenu} className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-xs">
                <ChevronLeft className="h-3.5 w-3.5" /> Zpět
              </button>
            ) : (
              <span className="text-sm font-semibold text-slate-800">Podpora</span>
            )}
            <button onClick={closeAll} className="text-slate-400 hover:text-slate-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Menu */}
          {!contactType && (
            <>
              <div className="p-2 space-y-1">
                {(['support', 'idea', 'feedback'] as ContactType[]).map((type) => {
                  const m = TYPE_META[type]
                  const bg = type === 'support' ? 'bg-indigo-50' : type === 'idea' ? 'bg-amber-50' : 'bg-emerald-50'
                  const sub = type === 'support' ? 'fakturosupport@gmail.com' : type === 'idea' ? 'Váš nápad nás posouvá dál' : 'Řekněte nám co si myslíte'
                  return (
                    <button
                      key={type}
                      onClick={() => openForm(type)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition text-left"
                    >
                      <div className={`h-8 w-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                        {m.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.label}</p>
                        <p className="text-xs text-slate-400">{sub}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="px-4 py-3 border-t border-slate-50">
                <p className="text-xs text-slate-400 text-center">Odpovídáme do 24 hodin</p>
              </div>
            </>
          )}

          {/* Form */}
          {contactType && !sent && meta && (
            <div className="p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Předmět</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Předmět zprávy"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Zpráva</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={meta.placeholder}
                  rows={4}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                <Send className="h-3.5 w-3.5" />
                {sending ? 'Odesílám...' : 'Odeslat'}
              </button>
            </div>
          )}

          {/* Success */}
          {contactType && sent && (
            <div className="p-6 text-center space-y-2">
              <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Zpráva odeslána!</p>
              <p className="text-xs text-slate-400">Odpovídáme do 24 hodin.</p>
              <button onClick={backToMenu} className="text-xs text-indigo-600 hover:underline mt-1">Zpět na menu</button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => { setOpen(o => !o); if (open) { setContactType(null); setSent(false) } }}
        className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition"
        title="Podpora"
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>
    </div>
  )
}
