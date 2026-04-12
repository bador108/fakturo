'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { RecurringInvoice } from '@/types'

const recurrenceLabel: Record<string, string> = {
  weekly: 'Týdně',
  monthly: 'Měsíčně',
  quarterly: 'Čtvrtletně',
  yearly: 'Ročně',
}

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recurring')
      .then(r => r.json())
      .then(d => { setItems(d ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/recurring/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    setItems(prev => prev.map(r => r.id === id ? { ...r, is_active: !current } : r))
  }

  async function deleteRecurring(id: string) {
    if (!confirm('Opravdu smazat tuto opakující se šablonu?')) return
    await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Opakující se faktury</h1>
          <p className="text-sm text-slate-400 mt-0.5">Automaticky generované faktury podle plánu</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Načítám…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Žádné opakující se faktury</p>
            <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
              Opakující se faktury jsou dostupné v plné verzi. Kontaktujte nás pro nastavení.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${r.is_active ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                  <RefreshCw className={`h-4 w-4 ${r.is_active ? 'text-indigo-400' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${r.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.client_name} · {recurrenceLabel[r.recurrence]} · další {formatDate(r.next_date)}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {r.is_active ? 'Aktivní' : 'Pozastaveno'}
                </span>
                <button
                  onClick={() => toggleActive(r.id, r.is_active)}
                  className="text-slate-400 hover:text-indigo-600 transition"
                  title={r.is_active ? 'Pozastavit' : 'Aktivovat'}
                >
                  {r.is_active ? <ToggleRight className="h-5 w-5 text-indigo-500" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => deleteRecurring(r.id)}
                  className="text-slate-300 hover:text-red-500 transition"
                  title="Smazat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <Plus className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">Přidat opakující se fakturu</p>
            <p className="text-xs text-indigo-600 mt-1">
              Funkce plánování opakujících se faktur bude brzy dostupná. Faktura se automaticky vytvoří v nastavený den a odešle klientovi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
