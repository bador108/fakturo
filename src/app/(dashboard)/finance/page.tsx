import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import type { Invoice, Expense } from '@/types'
import { PohodaExportButton } from '@/components/PohodaExportButton'
import { FinanceDashboardGrid } from '@/components/FinanceDashboardGrid'

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
  const [{ data: invData }, { data: expData }, { data: userData }] = await Promise.all([
    db.from('invoices').select('*').eq('user_id', userId).order('issue_date', { ascending: false }),
    db.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
    db.from('users').select('dashboard_layout').eq('id', userId).single(),
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Finance</h1>
          <p className="text-sm text-slate-400 mt-0.5">Přehled příjmů, výdajů a DPH</p>
        </div>
        <PohodaExportButton />
      </div>

      <FinanceDashboardGrid
        stats={{
          totalRevenue,
          totalExpenses,
          netProfit,
          totalVat,
          totalPendingAndOverdue: totalPending + totalOverdue,
        }}
        chartMonths={chartMonths}
        catSlices={catSlices}
        monthRows={monthRows}
        invoiceCount={invoices.length}
        initialLayout={userData?.dashboard_layout ?? null}
      />
    </div>
  )
}
