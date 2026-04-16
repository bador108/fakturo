'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

const BOTCRAFT_API = 'https://botcraft.vercel.app/api/chat'
const THEME = '#6366f1'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  botId: string
}

export function BotcraftWidget({ botId }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ahoj! Jsem Fakturo AI. Pomůžu vám s orientací v aplikaci – faktury, klienti, výdaje nebo nastavení. Co potřebujete?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch(BOTCRAFT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, messages: newMessages, domain: window.location.hostname }),
      })

      if (!res.ok) {
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Něco se pokazilo, zkuste to znovu.' }])
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: full }])
      }
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Chyba připojení, zkuste to znovu.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      {/* Toggle button — hidden when chat is open */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="AI Asistent"
          className="fixed bottom-5 right-5 z-[9999] h-14 w-14 rounded-full border-none text-white flex items-center justify-center shadow-xl transition-colors"
          style={{ background: THEME, boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-[9998] flex flex-col bg-white shadow-2xl
            inset-0
            md:inset-auto md:bottom-24 md:right-5 md:w-96 md:h-[560px] md:rounded-2xl md:border md:border-slate-100"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0 rounded-t-2xl" style={{ background: THEME }}>
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
            <div>
              <p className="font-semibold text-white text-sm leading-tight">Fakturo AI</p>
              <p className="text-xs text-white/70">Powered by AI</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm" style={{ background: THEME + '20' }}>
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user' ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                  style={msg.role === 'user' ? { background: THEME } : undefined}
                >
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 shrink-0">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Napište zprávu..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-full border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="h-9 w-9 rounded-full flex items-center justify-center transition disabled:opacity-40 shrink-0 text-white"
                style={{ background: THEME }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
