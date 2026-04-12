'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

export function LandingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ahoj! Jsem Fakturo AI. Mohu vám pomoci s otázkami o aplikaci Fakturo — funkcích, cenách nebo jak začít. Co vás zajímá?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'Omlouvám se, nastala chyba.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Omlouvám se, nastala chyba. Zkuste to prosím znovu.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden mb-2 flex flex-col" style={{ height: '440px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white">
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Fakturo AI</p>
              <p className="text-xs text-indigo-200">Zeptejte se na cokoliv</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  {m.role === 'assistant' ? <Bot className="h-3.5 w-3.5 text-indigo-600" /> : <User className="h-3.5 w-3.5 text-slate-500" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-slate-50 text-slate-800' : 'bg-indigo-600 text-white'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-400">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Napište zprávu..."
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition"
        title="Zeptejte se AI"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}
