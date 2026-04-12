import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const db = createServiceClient()
  const { data, error } = await db
    .from('clients')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServiceClient()
  await db.from('clients').delete().eq('id', params.id).eq('user_id', userId)
  return NextResponse.json({ ok: true })
}
