import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'
import type { RecurringInvoice } from '@/types'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('recurring_invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as Omit<RecurringInvoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('plan, email').eq('id', userId).single()
  if (!isPro(getEffectivePlan(user?.plan ?? 'free', user?.email))) {
    return NextResponse.json({ error: 'Opakující se faktury jsou součástí Pro plánu.', code: 'PRO_REQUIRED' }, { status: 403 })
  }

  const { data, error } = await db
    .from('recurring_invoices')
    .insert({ ...body, user_id: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
