'use client'

import { useState, useEffect } from 'react'
import { Receipt, Plus, Trash2, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense, ExpenseCategory, Currency } from '@/types'

const categories: { key: ExpenseCategory; label: string }[] = [
  { key: 'kancelar', label: 'Kancelář' },
  { key: 'cestovne', label: 'Cestovné' },
  { key: 'software', label: 'Software' },
  { key: 'hardware', label: 'Hardware' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'ostatni', label: 'Ostatní' },
]

const catColors: Record<ExpenseCategory, string> = {
  kancelar: 'bg-blue-50 text-blue-600',
  cestovne: 'bg-amber-50 text-amber-600',
  software: 'bg-purple-50 text-purple-600',
  hardware: 'bg-slate-100 text-slate-600',
  marketing: 'bg-pink-50 text-pink-600',
  ostatni: 'bg-slate-100 text-slate-500',
}

const today = new Date().toISOString().slice(0, 10)

const emptyForm = {
  date: today, vendor: '', description: '', amount: '', currency: 'CZK' as Currency,
  category: 'ostatni' as ExpenseCategory, vat_claimable: false,
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/expenses')
      .then(r => r.json())
      .then(d => { setExpenses(d ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function addExpense() {
    if (!form.vendor || !form.amount) return
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount), receipt_url: null }),
      })
      const data = await res.json()
      setExpenses(prev => [data, ...prev])
      setShowForm(false)
      setForm(emptyForm)
    } finally {
      setSaving(false)
    }
  }

  async function deleteExpense(id: string) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const totalByCurrency = expenses.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] ?? 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Výdaje</h1>
          <p className="text-sm text-slate-400 mt-0.5">Evidence nákladů pro daňové účely</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
        >
          <Plus className="h-4 w-4" />
          Přidat výdaj
        </button>
      </div>

      {/* Totals */}
      {expenses.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(totalByCurrency).map(([cur, total]) => (
            <div key={cur} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
              <p className="text-xs text-slate-400">Celkem výdajů ({cur})</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(total, cur as Currency)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Přidat výdaj</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Datum</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kategorie</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dodavatel / název</label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder="např. Adobe, Bolt, Alza..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Popis (volitelné)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Předplatné, letenka Praha-Berlín..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Částka</label>
                <input type="number" min={0} step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Měna</label>
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value as Currency }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="CZK">CZK</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.vat_claimable} onChange={e => setForm(f => ({ ...f, vat_claimable: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600" />
              Uplatnitelné DPH
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition">Zrušit</button>
              <button onClick={addExpense} disabled={!form.vendor || !form.amount || saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium">
                {saving ? 'Ukládám…' : 'Uložit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Načítám…</div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Žádné výdaje</p>
            <p className="text-xs text-slate-400 mt-1">Evidujte náklady pro přehled a daně</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {expenses.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 group">
                <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <Receipt className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{e.vendor}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(e.date)}{e.description ? ` · ${e.description}` : ''}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColors[e.category]}`}>
                  {categories.find(c => c.key === e.category)?.label}
                </span>
                {e.vat_claimable && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">DPH</span>
                )}
                <span className="font-semibold text-slate-800 text-sm w-28 text-right tabular-nums">
                  {formatCurrency(e.amount, e.currency)}
                </span>
                <button onClick={() => deleteExpense(e.id)} className="text-slate-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
