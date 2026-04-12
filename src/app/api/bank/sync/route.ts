import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getAccountTransactions } from '@/lib/gocardless'
import { createServiceClient } from '@/lib/supabase'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: connection } = await db
    .from('bank_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!connection?.account_id) {
    return NextResponse.json({ error: 'Žádné aktivní bankovní propojení' }, { status: 400 })
  }

  // Fetch transactions from last 90 days
  const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { transactions } = await getAccountTransactions(connection.account_id, dateFrom)
  const booked: { transactionAmount: { amount: string; currency: string }; remittanceInformationUnstructured?: string; valueDate?: string }[] = transactions?.booked ?? []

  // Fetch open invoices for this user
  const { data: invoices } = await db
    .from('invoices')
    .select('id, total, currency, invoice_number, status')
    .eq('user_id', userId)
    .eq('status', 'sent')

  let matched = 0

  for (const tx of booked) {
    const txAmount = parseFloat(tx.transactionAmount.amount)
    if (txAmount <= 0) continue // skip debits

    const txCurrency = tx.transactionAmount.currency
    const txInfo = (tx.remittanceInformationUnstructured ?? '').toLowerCase()

    for (const invoice of invoices ?? []) {
      if (invoice.currency !== txCurrency) continue
      if (Math.abs(parseFloat(invoice.total) - txAmount) > 0.01) continue

      // Match by amount + optional invoice number in description
      const numberMatch = txInfo.includes(invoice.invoice_number.toLowerCase()) || true // match by amount alone if no VS

      if (numberMatch) {
        await db.from('invoices').update({ status: 'paid' }).eq('id', invoice.id)
        matched++
        break
      }
    }
  }

  await db.from('bank_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', connection.id)

  return NextResponse.json({ matched, total: booked.length })
}
