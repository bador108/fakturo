'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export function SendRemindersButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function trigger() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/send-reminders', { method: 'POST' })
      const data = await res.json().catch(() => null)
      setResult(res.ok ? `Odesláno: ${data?.sent ?? 0}` : (data?.error ?? 'Nepodařilo se odeslat.'))
    } catch {
      setResult('Nepodařilo se odeslat.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={trigger}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-brand text-white px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-brand-dark transition disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {loading ? 'Odesílám…' : 'Poslat upomínky teď'}
      </button>
      {result && <span className="text-xs text-slate-500">{result}</span>}
    </div>
  )
}
