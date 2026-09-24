'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PromoCodeInfo } from '@/lib/coupons'

// Admin: slevové kódy "1 měsíc zdarma" (100 % na první měsíční platbu Start / Pro, každý jednou)
export function CouponsPanel() {
  const [codes, setCodes] = useState<PromoCodeInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/coupons').then(r => r.json()).then(d => setCodes(d.codes ?? [])).catch(() => {})
  }, [])

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Kupony se nepodařilo vytvořit.')
      setCodes(c => [...data.codes, ...c])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kupony se nepodařilo vytvořit.')
    } finally {
      setLoading(false)
    }
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(c => (c === code ? null : c)), 1500)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Ticket className="h-4 w-4 text-slate-400" />Kupony · 1 měsíc zdarma</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-brand text-white px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-brand-dark transition disabled:opacity-50"
        >
          {loading ? 'Generuji…' : 'Vygenerovat 5 kuponů'}
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-4">100 % sleva na první měsíc Startu nebo Pro. Každý kód jde použít jednou, zadává se v platbě u měsíčního předplatného.</p>
      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      {codes.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-2">
          {codes.map(c => (
            <li key={c.code} className={cn('flex items-center justify-between gap-2 rounded-lg border px-3 py-2', c.used ? 'border-slate-100 bg-slate-50' : 'border-slate-200')}>
              <span className={cn('font-mono text-sm', c.used ? 'text-slate-400 line-through' : 'text-slate-900')}>{c.code}</span>
              {c.used ? (
                <span className="text-xs text-slate-400">použitý</span>
              ) : (
                <button onClick={() => copy(c.code)} className="text-slate-400 hover:text-slate-700" aria-label={`Kopírovat ${c.code}`}>
                  {copied === c.code ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
