import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getAccountBalance, getAccountTransactions } from '@/lib/gocardless'
import { matchTransactionsToInvoices } from '@/lib/bankMatch'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: accounts } = await db
    .from('bank_accounts')
    .select('id, gocardless_account_id, iban, currency, display_name, connection_id, bank_connections!inner(status)')
    .eq('user_id', userId)
    .eq('bank_connections.status', 'active')

  if (!accounts?.length) {
    return NextResponse.json({ error: 'Žádný propojený bankovní účet' }, { status: 400 })
  }

  const { data: invoices } = await db
    .from('invoices')
    .select('id, total, currency, invoice_number, client_name')
    .eq('user_id', userId)
    .eq('status', 'sent')

  const accountResults: { iban: string | null; currency: string; balance: number | null; displayName: string | null }[] = []
  const allMatches: ReturnType<typeof matchTransactionsToInvoices> = []

  for (const account of accounts) {
    try {
      const [balance, transactions] = await Promise.all([
        getAccountBalance(account.gocardless_account_id).catch(() => null),
        getAccountTransactions(account.gocardless_account_id),
      ])

      if (balance) {
        await db.from('bank_accounts').update({
          balance: balance.amount,
          balance_synced_at: new Date().toISOString(),
        }).eq('id', account.id)
      }
      accountResults.push({ iban: account.iban, currency: account.currency, balance: balance?.amount ?? null, displayName: account.display_name })

      if (transactions.length) {
        await db.from('bank_transactions').upsert(
          transactions.map(tx => ({
            account_id: account.id,
            user_id: userId,
            gocardless_transaction_id: tx.externalId,
            amount: tx.amount,
            currency: tx.currency,
            booking_date: tx.date || null,
            description: tx.description,
          })),
          { onConflict: 'account_id,gocardless_transaction_id', ignoreDuplicates: true }
        )
      }

      const matches = matchTransactionsToInvoices(invoices ?? [], transactions)
      allMatches.push(...matches)
    } catch (err) {
      console.error(`/api/bank/sync: account ${account.id} failed:`, err)
    }
  }

  await db.from('bank_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'active')

  return NextResponse.json({ accounts: accountResults, matches: allMatches })
}
