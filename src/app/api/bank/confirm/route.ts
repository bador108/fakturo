import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { invoiceIds } = await req.json() as { invoiceIds: string[] }
  if (!invoiceIds?.length) return NextResponse.json({ error: 'Chybí IDs faktur' }, { status: 400 })

  const db = createServiceClient()
  await db
    .from('invoices')
    .update({ status: 'paid' })
    .in('id', invoiceIds)
    .eq('user_id', userId)

  return NextResponse.json({ updated: invoiceIds.length })
}
