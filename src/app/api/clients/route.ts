import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { ensureUser } from '@/lib/ensureUser'
import { getUserPlan, isPaid, FREE_CLIENT_LIMIT } from '@/lib/plan'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureUser(userId)
  const db = createServiceClient()
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureUser(userId)
  const db = createServiceClient()

  if (!isPaid(await getUserPlan(userId))) {
    const { count } = await db.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    if ((count ?? 0) >= FREE_CLIENT_LIMIT) {
      return NextResponse.json({ error: `Free plán má limit ${FREE_CLIENT_LIMIT} klientů. Upgradujte na Start nebo Pro.`, code: 'START_REQUIRED' }, { status: 403 })
    }
  }

  const body = await req.json()
  const { data, error } = await db
    .from('clients')
    .insert({ user_id: userId, ...body })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
