import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getConnection, listAccounts } from '@/lib/saltedge'

export async function GET(req: Request) {
  const { userId } = await auth()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'
  if (!userId) return NextResponse.redirect(`${appUrl}/sign-in`)

  const url = new URL(req.url)
  const connectionId = url.searchParams.get('connection_id')
  const customerId = url.searchParams.get('customer_id')
  const errorClass = url.searchParams.get('error_class')

  if (errorClass || !connectionId || !customerId) {
    return NextResponse.redirect(`${appUrl}/settings?bank=error`)
  }

  const db = createServiceClient()

  // customer_id v callbacku musí sedět na toho, koho jsme si uložili u tohohle usera —
  // jinak by šlo podvrhnout cizí connection_id a napojit si cizí bankovní účet.
  const { data: user } = await db.from('users').select('bank_provider_customer_id').eq('id', userId).single()
  if (!user?.bank_provider_customer_id || user.bank_provider_customer_id !== customerId) {
    return NextResponse.redirect(`${appUrl}/settings?bank=error`)
  }

  try {
    const connection = await getConnection(connectionId)
    if (connection.status !== 'active') {
      return NextResponse.redirect(`${appUrl}/settings?bank=error`)
    }

    const { data: row, error: insertErr } = await db.from('bank_connections').upsert({
      user_id: userId,
      provider: 'saltedge',
      provider_connection_id: connectionId,
      institution_name: connection.provider_name,
      status: 'active',
    }, { onConflict: 'provider_connection_id' }).select('id').single()
    if (insertErr || !row) throw insertErr ?? new Error('Insert selhal')

    const accounts = await listAccounts(connectionId)
    for (const acc of accounts) {
      await db.from('bank_accounts').upsert({
        connection_id: row.id,
        user_id: userId,
        provider_account_id: acc.id,
        iban: acc.extra?.iban ?? null,
        currency: acc.currency_code,
        display_name: acc.name,
        balance: acc.balance,
        balance_synced_at: new Date().toISOString(),
      }, { onConflict: 'provider_account_id' })
    }

    return NextResponse.redirect(`${appUrl}/settings?bank=connected`)
  } catch (err) {
    console.error('/api/bank/callback:', err)
    return NextResponse.redirect(`${appUrl}/settings?bank=error`)
  }
}
