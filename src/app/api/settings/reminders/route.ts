import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'
import { REMINDER_DAY_OPTIONS, isReminderTone, sortReminderDays } from '@/lib/reminderConfig'

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reminder_days, reminder_tone } = await req.json()
  if (!Array.isArray(reminder_days) || !reminder_days.every(d => REMINDER_DAY_OPTIONS.includes(d))) {
    return NextResponse.json({ error: 'Invalid reminder_days' }, { status: 400 })
  }
  if (reminder_tone !== undefined && !isReminderTone(reminder_tone)) {
    return NextResponse.json({ error: 'Invalid reminder_tone' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('plan, email').eq('id', userId).single()
  if (!isPro(getEffectivePlan(user?.plan ?? 'free', user?.email))) {
    return NextResponse.json({ error: 'Automatické upomínky jsou součástí Pro plánu.', code: 'PRO_REQUIRED' }, { status: 403 })
  }
  const { error } = await db
    .from('users')
    .update({ reminder_days: sortReminderDays(reminder_days), ...(reminder_tone && { reminder_tone }) })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
