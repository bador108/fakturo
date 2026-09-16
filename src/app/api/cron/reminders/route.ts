import { NextResponse } from 'next/server'
import { runReminders } from '@/lib/reminders'

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runReminders()
  return NextResponse.json(result)
}
