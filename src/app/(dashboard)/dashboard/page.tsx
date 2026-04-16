import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, FileText, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { Invoice } from '@/types'
import { CashflowChart } from '@/components/CashflowChart'
import { buildMonthData } from '@/lib/utils'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: invoices }, { data: user }] = await Promise.all([
    db.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('users').select('plan, invoice_count_this_month').eq('id', userId).single(),
  ])

  const plan = user?.plan ?? 'free'
  const usedThisMonth = user?.invoice_count_this_month ?? 0
  const all = (invoices ?? []) as Invoice[]

  const overdue = all.filter(i => i.status === 'sent' && i.due_date < today)

  const stats = {
    total: all.length,
    paid: all.filter(i => i.status === 'paid').length,
    draft: all.filter(i => i.status === 'draft').length,
    overdue: overdue.length,
    revenue: all.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0),
    pending: all.filter(i => i.status === 'sent' && i.due_date >= today).reduce((s, i) => s + Number(i.total), 0),
  }

  const statCards = [
    { label: 'Celkový příjem', value: formatCurrency(stats.revenue, 'CZK'), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Zaplaceno', value: stats.paid, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Čeká na platbu', value: formatCurrency(stats.pending, 'CZK'), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Po splatnosti', value: stats.overdue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ]

  const monthData = buildMonthData(all)
  const recent = all.slice(0, 8)

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Přehled</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {plan === 'free' ? `${usedThisMonth} faktur tento měsíc · Free plán` : 'Pro plán · neomezené faktury'}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
        >
          <Plus className="h-4 w-4" />
          Nová faktura
        </Link>
      </div>

      {/* Overdue alert */}
      {stats.overdue > 0 && (
        <Link href="/invoices?filter=overdue" className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 hover:bg-red-100/60 transition">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 font-medium">
            {stats.overdue} {stats.overdue === 1 ? 'faktura je' : stats.overdue < 5 ? 'faktury jsou' : 'faktur je'} po splatnosti
          </span>
          <span className="ml-auto text-xs text-red-500">Zobrazit →</span>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-5">
            <div className={`inline-flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-xl ${bg} mb-2 md:mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-lg md:text-2xl font-bold text-slate-900 leading-tight break-all">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Cashflow chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">Cashflow (posledních 6 měsíců)</h2>
        </div>
        <CashflowChart months={monthData} />
      </div>

      {/* Recent invoices */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Poslední faktury</h2>
          <Link href="/invoices" className="text-xs text-indigo-600 hover:underline">
            Zobrazit vše →
          </Link>
        </div>

        {!recent.length ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Zatím žádné faktury</p>
            <p className="text-xs text-slate-400 mt-1">Vytvořte svoji první fakturu</p>
            <Link
              href="/invoices/new"
              className="mt-5 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              Vytvořit fakturu
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map(inv => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-slate-50 transition group"
              >
                <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm group-hover:text-indigo-600 transition truncate">
                    {inv.client_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    #{inv.invoice_number} · splatnost {formatDate(inv.due_date)}
                  </p>
                </div>
                <StatusBadge status={inv.status} dueDate={inv.due_date} />
                <span className="font-semibold text-slate-800 text-sm shrink-0 text-right tabular-nums">
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
