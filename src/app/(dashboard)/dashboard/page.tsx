import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPaid } from '@/lib/plan'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, AlertCircle, FileText, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import type { Invoice, Expense } from '@/types'
import { FinanceDashboardGrid } from '@/components/FinanceDashboardGrid'
import { ProUpsell } from '@/components/ProUpsell'
import { StatusBadge } from '@/components/ui/badge'

interface MonthRow {
  month: string
  label: string
  subtotal: number
  vatAmount: number
  total: number
  paidTotal: number
  invoiceCount: number
}

function buildMonthRows(invoices: Invoice[]): MonthRow[] {
  const map = new Map<string, MonthRow>()
  for (const inv of invoices) {
    const key = inv.issue_date?.slice(0, 7) ?? ''
    if (!key) continue
    const [year, month] = key.split('-')
    const label = new Date(Number(year), Number(month) - 1, 1)
      .toLocaleString('cs-CZ', { month: 'long', year: 'numeric' })
    const existing = map.get(key) ?? { month: key, label, subtotal: 0, vatAmount: 0, total: 0, paidTotal: 0, invoiceCount: 0 }
    existing.invoiceCount++
    existing.subtotal += Number(inv.subtotal)
    existing.vatAmount += Number(inv.vat_amount)
    existing.total += Number(inv.total)
    if (inv.status === 'paid') existing.paidTotal += Number(inv.total)
    map.set(key, existing)
  }
  return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month))
}

const CAT_COLORS: Record<string, string> = {
  software:  '#6366f1',
  hardware:  '#8b5cf6',
  marketing: '#ec4899',
  kancelar:  '#3b82f6',
  cestovne:  '#f59e0b',
  ostatni:   '#94a3b8',
}
const CAT_LABELS: Record<string, string> = {
  software: 'Software', hardware: 'Hardware', marketing: 'Marketing',
  kancelar: 'Kancelář', cestovne: 'Cestovné', ostatni: 'Ostatní',
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const { data: userData } = await db.from('users').select('plan, email, invoice_count_this_month, dashboard_layout').eq('id', userId).single()
  const plan = getEffectivePlan(userData?.plan ?? 'free', userData?.email)
  const paidPlan = isPaid(plan)
  const usedThisMonth = userData?.invoice_count_this_month ?? 0
  const planLabel = plan === 'pro' ? 'Pro plán · neomezené faktury' : plan === 'start' ? 'Start plán · neomezené faktury' : `${usedThisMonth} faktur tento měsíc · Free plán`

  const { data: invData } = await db.from('invoices').select('*').eq('user_id', userId).order('issue_date', { ascending: false })
  const invoices = (invData ?? []) as Invoice[]
  const today = new Date().toISOString().slice(0, 10)
  const overdueCount = invoices.filter(i => i.status === 'sent' && i.due_date < today).length

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Přehled</h1>
        <p className="text-sm text-slate-400 mt-0.5">{planLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-dark transition shadow-sm shadow-brand-soft"
        >
          <Plus className="h-4 w-4" />
          Nová faktura
        </Link>
      </div>
    </div>
  )

  const overdueAlert = overdueCount > 0 && (
    <Link href="/invoices?filter=overdue" className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 hover:bg-red-100/60 transition">
      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
      <span className="text-sm text-red-700 font-medium">
        {overdueCount} {overdueCount === 1 ? 'faktura je' : overdueCount < 5 ? 'faktury jsou' : 'faktur je'} po splatnosti
      </span>
      <span className="ml-auto text-xs text-red-500">Zobrazit →</span>
    </Link>
  )

  // Free: jen holé počty a poslední faktury z invoices — bez výdajů/marže/grafů, to je Start+Pro.
  if (!paidPlan) {
    const stats = {
      total: invoices.length,
      paid: invoices.filter(i => i.status === 'paid').length,
      revenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0),
      pending: invoices.filter(i => i.status === 'sent' && i.due_date >= today).reduce((s, i) => s + Number(i.total), 0),
    }
    const statCards = [
      { label: 'Celkový příjem', value: formatCurrency(stats.revenue, 'CZK'), icon: TrendingUp, bg: 'bg-brand' },
      { label: 'Zaplaceno', value: stats.paid, icon: CheckCircle, bg: 'bg-emerald-600' },
      { label: 'Čeká na platbu', value: formatCurrency(stats.pending, 'CZK'), icon: Clock, bg: 'bg-amber-600' },
      { label: 'Po splatnosti', value: overdueCount, icon: AlertCircle, bg: 'bg-red-500' },
    ]
    const recent = invoices.slice(0, 8)

    return (
      <div className="space-y-8 max-w-5xl">
        {header}
        {overdueAlert}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statCards.map(({ label, value, icon: Icon, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-5">
              <div className={`inline-flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-full ${bg} mb-2 md:mb-3`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-slate-900 leading-tight break-all">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <ProUpsell
          title="Finanční přehledy a grafy"
          description="Výdaje, cashflow, marže a přizpůsobitelný dashboard s widgety — součást Start a Pro plánu."
          minPlan="start"
        />

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Poslední faktury</h2>
            <Link href="/invoices" className="text-xs text-brand hover:underline">Zobrazit vše →</Link>
          </div>
          {!recent.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Zatím žádné faktury</p>
              <p className="text-xs text-slate-400 mt-1">Vytvořte svoji první fakturu</p>
              <Link href="/invoices/new" className="mt-5 inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition">
                <Plus className="h-4 w-4" />
                Vytvořit fakturu
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map(inv => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-slate-50 transition group">
                  <div className="h-9 w-9 bg-brand-soft rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm group-hover:text-brand transition truncate">{inv.client_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">#{inv.invoice_number} · splatnost {formatDate(inv.due_date)}</p>
                  </div>
                  <StatusBadge status={inv.status} dueDate={inv.due_date} />
                  <span className="font-semibold text-slate-800 text-sm shrink-0 text-right tabular-nums">{formatCurrency(inv.total, inv.currency)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const [{ data: expData }, { count: clientCount }] = await Promise.all([
    db.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
    db.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])
  const expenses = (expData ?? []) as Expense[]

  // ČNB rates
  let cnbRates: Record<string, number> = {}
  try {
    const ratesRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'}/api/cnb-rates`, { next: { revalidate: 14400 } })
    if (ratesRes.ok) cnbRates = await ratesRes.json()
  } catch { /* fallback */ }

  function toCZK(amount: number, currency: string): number {
    if (currency === 'CZK') return amount
    return amount * (cnbRates[currency] ?? 1)
  }

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + toCZK(Number(i.total), i.currency), 0)
  const totalVat = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + toCZK(Number(i.vat_amount), i.currency), 0)
  const totalPending = invoices.filter(i => i.status === 'sent' && i.due_date >= today).reduce((s, i) => s + toCZK(Number(i.total), i.currency), 0)
  const totalOverdue = invoices.filter(i => i.status === 'sent' && i.due_date < today).reduce((s, i) => s + toCZK(Number(i.total), i.currency), 0)
  const totalExpenses = expenses.reduce((s, e) => s + toCZK(Number(e.amount), e.currency), 0)
  const netProfit = totalRevenue - totalExpenses

  const monthRows = buildMonthRows(invoices)

  // Build last 12 months chart data
  const now = new Date()
  const chartMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('cs-CZ', { month: 'short' })
    const revenue = invoices
      .filter(inv => inv.status === 'paid' && inv.issue_date?.startsWith(key))
      .reduce((s, inv) => s + toCZK(Number(inv.total), inv.currency), 0)
    const exp = expenses
      .filter(e => e.date?.startsWith(key))
      .reduce((s, e) => s + toCZK(Number(e.amount), e.currency), 0)
    return { label, revenue, expenses: exp }
  })

  // Expense breakdown by category
  const catTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + toCZK(Number(e.amount), e.currency)
    return acc
  }, {} as Record<string, number>)

  const catSlices = Object.entries(catTotals)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([key, amount]) => ({
      label: CAT_LABELS[key] ?? key,
      amount: Math.round(amount),
      color: CAT_COLORS[key] ?? '#94a3b8',
    }))

  // Extra agregace pro rozšířený katalog widgetů
  const avgInvoiceValue = invoices.length ? invoices.reduce((s, i) => s + toCZK(Number(i.total), i.currency), 0) / invoices.length : 0
  const marginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const STATUS_LABELS: Record<string, string> = { draft: 'Koncept', sent: 'Odesláno', paid: 'Zaplaceno', cancelled: 'Storno' }
  const STATUS_COLORS: Record<string, string> = { draft: '#94a3b8', sent: '#3b82f6', paid: '#10b981', cancelled: '#ef4444' }
  const statusCounts = invoices.reduce((acc, i) => { acc[i.status] = (acc[i.status] ?? 0) + 1; return acc }, {} as Record<string, number>)
  const statusSlices = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([key, amount]) => ({ label: STATUS_LABELS[key] ?? key, amount, color: STATUS_COLORS[key] ?? '#94a3b8' }))

  const CURRENCY_COLORS: Record<string, string> = { CZK: '#0c0c0e', EUR: '#0ea5e9', USD: '#10b981' }
  const currencyTotals = invoices.reduce((acc, i) => { acc[i.currency] = (acc[i.currency] ?? 0) + Number(i.total); return acc }, {} as Record<string, number>)
  const currencySlices = Object.entries(currencyTotals)
    .filter(([, v]) => v > 0)
    .map(([key, amount]) => ({ label: key, amount: Math.round(amount), color: CURRENCY_COLORS[key] ?? '#94a3b8' }))

  const weeklyRevenue = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now.getTime() - (7 - i) * 7 * 86400000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
    const revenue = invoices
      .filter(inv => inv.status === 'paid' && inv.issue_date >= weekStart.toISOString().slice(0, 10) && inv.issue_date < weekEnd.toISOString().slice(0, 10))
      .reduce((s, inv) => s + toCZK(Number(inv.total), inv.currency), 0)
    return { label: `${weekStart.getDate()}.${weekStart.getMonth() + 1}.`, revenue }
  })

  const clientTotals = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => { acc[i.client_name] = (acc[i.client_name] ?? 0) + toCZK(Number(i.total), i.currency); return acc }, {} as Record<string, number>)
  const topClients = Object.entries(clientTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount: Math.round(amount) }))

  const overdueList = invoices
    .filter(i => i.status === 'sent' && i.due_date < today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5)
    .map(i => ({ id: i.id, clientName: i.client_name, invoiceNumber: i.invoice_number, total: Number(i.total), currency: i.currency, daysOverdue: Math.round((new Date(today).getTime() - new Date(i.due_date).getTime()) / 86400000) }))

  const recentList = invoices
    .slice(0, 5)
    .map(i => ({ id: i.id, clientName: i.client_name, invoiceNumber: i.invoice_number, total: Number(i.total), currency: i.currency, status: i.status }))

  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const dueSoonList = invoices
    .filter(i => i.status === 'sent' && i.due_date >= today && i.due_date <= in7Days)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5)
    .map(i => ({ id: i.id, clientName: i.client_name, invoiceNumber: i.invoice_number, total: Number(i.total), currency: i.currency, dueDate: i.due_date }))

  return (
    <div className="space-y-6">
      {header}
      {overdueAlert}

      <FinanceDashboardGrid
        stats={{
          totalRevenue,
          totalExpenses,
          netProfit,
          totalVat,
          totalPendingAndOverdue: totalPending + totalOverdue,
          avgInvoiceValue,
          marginPct,
          clientCount: clientCount ?? 0,
        }}
        chartMonths={chartMonths}
        catSlices={catSlices}
        statusSlices={statusSlices}
        currencySlices={currencySlices}
        weeklyRevenue={weeklyRevenue}
        topClients={topClients}
        overdueList={overdueList}
        recentList={recentList}
        dueSoonList={dueSoonList}
        monthRows={monthRows}
        invoiceCount={invoices.length}
        initialLayout={userData?.dashboard_layout ?? null}
      />
    </div>
  )
}
