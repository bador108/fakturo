import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isProOverride } from '@/lib/stripe'
import { runReminders } from '@/lib/reminders'

// Owner-only manual trigger for the reminders cron — no CRON_SECRET needed,
// gated by the same isProOverride() check as /zpravy.
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('email').eq('id', userId).single()
  if (!isProOverride(user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const result = await runReminders()
  return NextResponse.json(result)
}
