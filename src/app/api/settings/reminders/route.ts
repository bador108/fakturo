import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reminder_days } = await req.json()
  if (!Array.isArray(reminder_days)) {
    return NextResponse.json({ error: 'Invalid reminder_days' }, { status: 400 })
  }

  const db = createServiceClient()
  const { error } = await db
    .from('users')
    .update({ reminder_days })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
