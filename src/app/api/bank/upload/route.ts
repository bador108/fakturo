import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { parseBankFile } from '@/lib/bankParser'
import { matchTransactionsToInvoices } from '@/lib/bankMatch'

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

  const matches = matchTransactionsToInvoices(invoices ?? [], transactions)

  return NextResponse.json({ transactions: transactions.length, matches })
}
