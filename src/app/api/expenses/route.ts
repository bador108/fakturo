import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getUserPlan, isPaid } from '@/lib/plan'
import type { Expense } from '@/types'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isPaid(await getUserPlan(userId))) {
    return NextResponse.json({ error: 'Evidence výdajů je součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isPaid(await getUserPlan(userId))) {
    return NextResponse.json({ error: 'Evidence výdajů je součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 })
  }

  const body = await req.json() as Omit<Expense, 'id' | 'user_id' | 'created_at'>
  const db = createServiceClient()

  const { data, error } = await db
    .from('expenses')
    .insert({ ...body, user_id: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
