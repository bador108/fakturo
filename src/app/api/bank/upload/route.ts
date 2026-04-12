import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { parseBankFile } from '@/lib/bankParser'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Chybí soubor' }, { status: 400 })

  const content = await file.text()
  const transactions = parseBankFile(content, file.name)

  if (!transactions.length) {
    return NextResponse.json({ error: 'Nepodařilo se načíst žádné transakce. Zkontrolujte formát souboru.' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: invoices } = await db
    .from('invoices')
    .select('id, total, currency, invoice_number, client_name')
    .eq('user_id', userId)
    .eq('status', 'sent')

  const matches: { invoiceId: string; invoiceNumber: string; clientName: string; amount: number; currency: string; txDate: string }[] = []
  const usedTxAmounts = new Set<string>()

  for (const invoice of invoices ?? []) {
    const invoiceTotal = parseFloat(invoice.total)
    const match = transactions.find(tx => {
      const key = `${tx.amount}-${tx.date}`
      if (usedTxAmounts.has(key)) return false
      return (
        tx.currency === invoice.currency &&
        Math.abs(tx.amount - invoiceTotal) < 0.02
      )
    })
    if (match) {
      const key = `${match.amount}-${match.date}`
      usedTxAmounts.add(key)
      matches.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        amount: match.amount,
        currency: match.currency,
        txDate: match.date,
      })
    }
  }

  return NextResponse.json({ transactions: transactions.length, matches })
}
