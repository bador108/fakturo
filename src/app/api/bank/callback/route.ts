import { NextResponse } from 'next/server'
import { getRequisition } from '@/lib/gocardless'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fakturo-seven.vercel.app'

  if (!ref) return NextResponse.redirect(`${appUrl}/settings?bank=error`)

  const db = createServiceClient()
  const { data: connection } = await db
    .from('bank_connections')
    .select('*')
    .eq('requisition_id', ref)
    .single()

  if (!connection) return NextResponse.redirect(`${appUrl}/settings?bank=error`)

  try {
    const requisition = await getRequisition(ref)
    const accountId = requisition.accounts?.[0] ?? null

    await db.from('bank_connections').update({
      account_id: accountId,
      status: accountId ? 'active' : 'error',
    }).eq('requisition_id', ref)
  } catch {
    await db.from('bank_connections').update({ status: 'error' }).eq('requisition_id', ref)
    return NextResponse.redirect(`${appUrl}/settings?bank=error`)
  }

  return NextResponse.redirect(`${appUrl}/settings?bank=success`)
}
