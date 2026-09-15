import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'
import { listAccounts, listTransactions } from '@/lib/saltedge'
import { matchTransactionsToInvoices } from '@/lib/bankMatch'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: user } = await db.from('users').select('plan, email').eq('id', userId).single()
  if (!isPro(getEffectivePlan(user?.plan ?? 'free', user?.email))) {
    return NextResponse.json({ error: 'Propojení s bankou je součástí Pro plánu.', code: 'PRO_REQUIRED' }, { status: 403 })
  }

  const { data: connections } = await db
    .from('bank_connections')
    .select('id, provider_connection_id')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (!connections?.length) {
    return NextResponse.json({ error: 'Žádný propojený bankovní účet' }, { status: 400 })
  }

  const { data: invoices } = await db
    .from('invoices')
    .select('id, total, currency, invoice_number, client_name')
    .eq('user_id', userId)
    .eq('status', 'sent')

  const accountResults: { iban: string | null; currency: string; balance: number | null; displayName: string | null }[] = []
  const allMatches: ReturnType<typeof matchTransactionsToInvoices> = []

  for (const connection of connections) {
    try {
      const accounts = await listAccounts(connection.provider_connection_id)

      for (const acc of accounts) {
        const { data: accountRow } = await db.from('bank_accounts').upsert({
          connection_id: connection.id,
          user_id: userId,
          provider_account_id: acc.id,
          iban: acc.extra?.iban ?? null,
          currency: acc.currency_code,
          display_name: acc.name,
          balance: acc.balance,
          balance_synced_at: new Date().toISOString(),
        }, { onConflict: 'provider_account_id' }).select('id').single()

        accountResults.push({ iban: acc.extra?.iban ?? null, currency: acc.currency_code, balance: acc.balance, displayName: acc.name })

        const transactions = await listTransactions(connection.provider_connection_id, acc.id)

        if (accountRow && transactions.length) {
          await db.from('bank_transactions').upsert(
            transactions.map(tx => ({
              account_id: accountRow.id,
              user_id: userId,
              provider_transaction_id: tx.externalId,
              amount: tx.amount,
              currency: tx.currency,
              booking_date: tx.date || null,
              description: tx.description,
            })),
            { onConflict: 'account_id,provider_transaction_id', ignoreDuplicates: true }
          )
        }

        const matches = matchTransactionsToInvoices(invoices ?? [], transactions)
        allMatches.push(...matches)
      }

      await db.from('bank_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', connection.id)
    } catch (err) {
      console.error(`/api/bank/sync: connection ${connection.id} failed:`, err)
    }
  }

  return NextResponse.json({ accounts: accountResults, matches: allMatches })
}
