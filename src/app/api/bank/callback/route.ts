import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getRequisition, getAccountDetails } from '@/lib/gocardless'

export async function GET(req: Request) {
  const { userId } = await auth()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'
  if (!userId) return NextResponse.redirect(`${appUrl}/sign-in`)

  const ref = new URL(req.url).searchParams.get('ref')
  if (!ref) return NextResponse.redirect(`${appUrl}/settings?bank=error`)

  const db = createServiceClient()
  const { data: connection } = await db
    .from('bank_connections')
    .select('id, requisition_id, user_id')
    .eq('id', ref)
    .eq('user_id', userId)
    .single()

  if (!connection) return NextResponse.redirect(`${appUrl}/settings?bank=error`)

  try {
    const requisition = await getRequisition(connection.requisition_id)

    if (requisition.status !== 'LN' || requisition.accounts.length === 0) {
      // LN = "linked" u GoCardless — cokoliv jiného (zamítnuto, expirováno v průběhu) je chyba.
      await db.from('bank_connections').update({ status: 'error' }).eq('id', connection.id)
      return NextResponse.redirect(`${appUrl}/settings?bank=error`)
    }

    for (const accountId of requisition.accounts) {
      const details = await getAccountDetails(accountId).catch(() => null)
      await db.from('bank_accounts').upsert({
        connection_id: connection.id,
        user_id: userId,
        gocardless_account_id: accountId,
        iban: details?.iban ?? null,
        currency: details?.currency ?? 'CZK',
        display_name: details?.product ?? details?.ownerName ?? null,
      }, { onConflict: 'gocardless_account_id' })
    }

    await db.from('bank_connections').update({ status: 'active' }).eq('id', connection.id)

    return NextResponse.redirect(`${appUrl}/settings?bank=connected`)
  } catch (err) {
    console.error('/api/bank/callback:', err)
    await db.from('bank_connections').update({ status: 'error' }).eq('id', connection.id)
    return NextResponse.redirect(`${appUrl}/settings?bank=error`)
  }
}
