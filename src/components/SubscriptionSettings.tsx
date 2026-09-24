'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton'
import type { SubscriptionSummary } from '@/lib/subscription'

interface Props {
  planName: string
  initial: SubscriptionSummary
}

export function SubscriptionSettings({ planName, initial }: Props) {
  const [summary, setSummary] = useState(initial)
  const [confirmOff, setConfirmOff] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const period = summary.interval === 'year' ? 'roční' : 'měsíční'
  const end = summary.periodEnd ? formatDate(summary.periodEnd) : null

  async function update(autoRenew: boolean) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoRenew }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data) throw new Error(data?.error ?? 'Předplatné se nepodařilo změnit.')
      setSummary(data)
      setConfirmOff(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Předplatné se nepodařilo změnit.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-900">{planName} plán</span> · {period} předplatné
      </p>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Automaticky obnovovat</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {summary.autoRenew
              ? `Další platba proběhne ${end ?? 'na konci období'}. Vypnout můžeš kdykoliv.`
              : `Předplatné skončí ${end ?? 'na konci zaplaceného období'}. Do té doby máš všechny funkce, pak přejdeš na Free. Faktury a data ti zůstanou.`}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={summary.autoRenew}
          aria-label="Automaticky obnovovat předplatné"
          disabled={saving}
          onClick={() => (summary.autoRenew ? setConfirmOff(true) : update(true))}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50',
            summary.autoRenew ? 'bg-brand' : 'bg-slate-300'
          )}
        >
          <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', summary.autoRenew && 'translate-x-5')} />
        </button>
      </div>

      {confirmOff && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm text-amber-900">
            Vypnout obnovení? Žádná další platba se nestrhne a {end ? `od ${end}` : 'po konci období'} přejdeš na Free plán.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => update(false)} disabled={saving} className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
              {saving ? 'Vypínám…' : 'Vypnout obnovení'}
            </button>
            <button type="button" onClick={() => setConfirmOff(false)} className="text-sm font-medium px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              Nechat zapnuté
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <ManageSubscriptionButton />
        <span className="text-xs text-slate-400">Platební karta, faktury za předplatné, změna plánu</span>
      </div>
    </div>
  )
}
