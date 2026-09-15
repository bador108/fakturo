import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('sender_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const db = createServiceClient()

  const [{ data: user }, { count }] = await Promise.all([
    db.from('users').select('plan, email').eq('id', userId).single(),
    db.from('sender_profiles').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])
  if (!isPro(getEffectivePlan(user?.plan ?? 'free', user?.email)) && (count ?? 0) >= 1) {
    return NextResponse.json({ error: 'Víc profilů dodavatele je součástí Pro plánu.', code: 'PRO_REQUIRED' }, { status: 403 })
  }

  const { data, error } = await db
    .from('sender_profiles')
    .insert({ ...body, user_id: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
