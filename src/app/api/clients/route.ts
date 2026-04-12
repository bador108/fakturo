import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { ensureUser } from '@/lib/ensureUser'

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
  const body = await req.json()
  const db = createServiceClient()
  const { data, error } = await db
    .from('clients')
    .insert({ user_id: userId, ...body })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
