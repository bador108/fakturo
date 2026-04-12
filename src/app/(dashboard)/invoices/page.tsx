'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice, InvoiceFilter } from '@/types'

const filters: { key: InvoiceFilter; label: string }[] = [
  { key: 'all', label: 'Vše' },
  { key: 'sent', label: 'Odesláno' },
  { key: 'paid', label: 'Zaplaceno' },
  { key: 'overdue', label: 'Po splatnosti' },
  { key: 'draft', label: 'Koncepty' },
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<InvoiceFilter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Read filter from URL
    const params = new URLSearchParams(window.location.search)
    const f = params.get('filter') as InvoiceFilter | null
    if (f && filters.some(x => x.key === f)) setFilter(f)

    fetch('/api/invoices')
      .then(r => r.json())
      .then(d => { setInvoices(d ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().slice(0, 10)

  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase())

    if (!matchSearch) return false

    if (filter === 'overdue') return inv.status === 'sent' && inv.due_date < today
    if (filter === 'sent') return inv.status === 'sent' && inv.due_date >= today
    if (filter === 'paid') return inv.status === 'paid'
    if (filter === 'draft') return inv.status === 'draft'
    return true
  })

  const counts: Record<InvoiceFilter, number> = {
    all: invoices.length,
    sent: invoices.filter(i => i.status === 'sent' && i.due_date >= today).length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'sent' && i.due_date < today).length,
    draft: invoices.filter(i => i.status === 'draft').length,
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Faktury</h1>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
        >
          <Plus className="h-4 w-4" />
          Nová faktura
        </Link>
      </div>

      {/* Filters + search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-slate-100 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition whitespace-nowrap ${
                filter === f.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hledat klienta nebo číslo faktury…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Načítám…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <FileText className="h-10 w-10 text-slate-200 mb-3" />
            <p className="text-sm text-slate-500">Žádné faktury</p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="mt-2 text-xs text-indigo-600 hover:underline">
                Zobrazit vše
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(inv => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition group"
              >
                <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm group-hover:text-indigo-600 transition truncate">
                    {inv.client_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    #{inv.invoice_number} · vystaven {formatDate(inv.issue_date)} · splatnost {formatDate(inv.due_date)}
                  </p>
                </div>
                <StatusBadge status={inv.status} dueDate={inv.due_date} />
                <span className="font-semibold text-slate-800 text-sm w-28 text-right tabular-nums">
                  {formatCurrency(inv.total, inv.currency)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
