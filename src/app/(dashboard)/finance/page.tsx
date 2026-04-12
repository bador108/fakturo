import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Receipt, AlertCircle, Wallet } from 'lucide-react'
import type { Invoice, Expense } from '@/types'
import { PohodaExportButton } from '@/components/PohodaExportButton'
import { RevenueExpensesChart, CategoryDonut, ProfitSparkline } from '@/components/FinanceCharts'

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

export default async function FinancePage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const [{ data: invData }, { data: expData }] = await Promise.all([
    db.from('invoices').select('*').eq('user_id', userId).order('issue_date', { ascending: false }),
    db.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ])

  const invoices = (invData ?? []) as Invoice[]
  const expenses = (expData ?? []) as Expense[]
  const today = new Date().toISOString().slice(0, 10)

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

  // Build last 6 months chart data
  const now = new Date()
  const chartMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
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

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Finance</h1>
          <p className="text-sm text-slate-400 mt-0.5">Přehled příjmů, výdajů a DPH</p>
        </div>
        <PohodaExportButton />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">{formatCurrency(totalRevenue, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Celkové příjmy</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">{formatCurrency(totalExpenses, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Celkové výdaje</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-4 ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <Wallet className={`h-4 w-4 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
          </div>
          <p className={`text-lg font-bold tabular-nums ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit, 'CZK')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Čistý zisk</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Receipt className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">{formatCurrency(totalVat, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">DPH k odvodu</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">{formatCurrency(totalPending + totalOverdue, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Čeká na platbu</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Revenue vs Expenses bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Příjmy vs. výdaje</h2>
          <RevenueExpensesChart months={chartMonths} />
          <div className="mt-4 pt-4 border-t border-slate-50">
            <ProfitSparkline months={chartMonths} />
          </div>
        </div>

        {/* Category donut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Výdaje podle kategorií</h2>
          <CategoryDonut slices={catSlices} />
          {catSlices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Celkem výdajů</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalExpenses, 'CZK')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800">Měsíční přehled</h2>
        </div>
        {monthRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">Žádná data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Měsíc</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Faktur</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Základ DPH</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">DPH</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Fakturováno</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400">Zaplaceno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monthRows.map(row => (
                  <tr key={row.month} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-medium text-slate-800 capitalize">{row.label}</td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{row.invoiceCount}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">{formatCurrency(row.subtotal, 'CZK')}</td>
                    <td className="px-4 py-3.5 text-right text-amber-600 tabular-nums">{formatCurrency(row.vatAmount, 'CZK')}</td>
                    <td className="px-4 py-3.5 text-right text-slate-700 font-medium tabular-nums">{formatCurrency(row.total, 'CZK')}</td>
                    <td className="px-6 py-3.5 text-right text-emerald-600 font-semibold tabular-nums">{formatCurrency(row.paidTotal, 'CZK')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-100 bg-slate-50/50">
                <tr>
                  <td className="px-6 py-3.5 font-semibold text-slate-700">Celkem</td>
                  <td className="px-4 py-3.5 text-right text-slate-600">{invoices.length}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-700 tabular-nums">
                    {formatCurrency(monthRows.reduce((s, r) => s + r.subtotal, 0), 'CZK')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-amber-700 tabular-nums">
                    {formatCurrency(monthRows.reduce((s, r) => s + r.vatAmount, 0), 'CZK')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-700 tabular-nums">
                    {formatCurrency(monthRows.reduce((s, r) => s + r.total, 0), 'CZK')}
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(totalRevenue, 'CZK')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
