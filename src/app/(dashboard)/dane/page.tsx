import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { getUserPlan, isPaid } from '@/lib/plan'
import { TaxEstimateClient } from '@/components/TaxEstimateClient'

export default async function TaxPage() {
  const { userId } = await auth()
  if (!userId) return null

  const paid = isPaid(await getUserPlan(userId))
  const now = new Date()
  const year = now.getFullYear()

  if (!paid) {
    return <TaxEstimateClient isPaidPlan={false} year={year} yearFraction={1} data={null} />
  }

  const from = `${year}-01-01`
  const to = `${year}-12-31`
  const db = createServiceClient()
  const [{ data: invoices }, { data: expenses }] = await Promise.all([
    db.from('invoices').select('subtotal, status, currency, vat_payer, invoice_type, issue_date').eq('user_id', userId).gte('issue_date', from).lte('issue_date', to).order('issue_date', { ascending: false }),
    db.from('expenses').select('amount, currency').eq('user_id', userId).gte('date', from).lte('date', to),
  ])

  const invoiceRows = (invoices ?? []).filter(i => i.invoice_type === 'faktura')
  const czk = invoiceRows.filter(i => (i.currency ?? 'CZK') === 'CZK')
  const sum = (rows: { subtotal: number }[]) => rows.reduce((acc, r) => acc + Number(r.subtotal ?? 0), 0)

  const paidRows = czk.filter(i => i.status === 'paid')
  const pendingRows = czk.filter(i => i.status === 'sent' || i.status === 'overdue')
  const expenseRows = (expenses ?? []).filter(e => (e.currency ?? 'CZK') === 'CZK')

  const startOfYear = new Date(year, 0, 1).getTime()
  const endOfYear = new Date(year + 1, 0, 1).getTime()
  const yearFraction = Math.min(1, Math.max(0.01, (now.getTime() - startOfYear) / (endOfYear - startOfYear)))

  return (
    <TaxEstimateClient
      isPaidPlan
      year={year}
      yearFraction={yearFraction}
      data={{
        incomePaid: Math.round(sum(paidRows)),
        incomePending: Math.round(sum(pendingRows)),
        paidCount: paidRows.length,
        expenses: Math.round(expenseRows.reduce((acc, e) => acc + Number(e.amount ?? 0), 0)),
        expenseCount: expenseRows.length,
        skippedForeign: invoiceRows.length - czk.length + (expenses ?? []).length - expenseRows.length,
        vatPayer: Boolean(invoiceRows[0]?.vat_payer),
      }}
    />
  )
}
