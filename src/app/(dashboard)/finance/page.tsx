import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { BarChart2, TrendingUp, Receipt, AlertCircle } from 'lucide-react'
import type { Invoice } from '@/types'

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

export default async function FinancePage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const { data } = await db
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('issue_date', { ascending: false })

  const invoices = (data ?? []) as Invoice[]
  const today = new Date().toISOString().slice(0, 10)

  const totals = {
    revenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0),
    vat: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.vat_amount), 0),
    pending: invoices.filter(i => i.status === 'sent' && i.due_date >= today).reduce((s, i) => s + Number(i.total), 0),
    overdue: invoices.filter(i => i.status === 'sent' && i.due_date < today).reduce((s, i) => s + Number(i.total), 0),
  }

  const monthRows = buildMonthRows(invoices)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Finance</h1>
        <p className="text-sm text-slate-400 mt-0.5">Přehled příjmů a DPH</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-50 mb-3">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.revenue, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Celkové příjmy</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-50 mb-3">
            <Receipt className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.vat, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">DPH celkem (zaplacené)</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-50 mb-3">
            <BarChart2 className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.pending, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Čeká na platbu</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-red-50 mb-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.overdue, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Po splatnosti</p>
        </div>
      </div>

      {/* Monthly breakdown */}
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
                    {formatCurrency(totals.revenue, 'CZK')}
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
