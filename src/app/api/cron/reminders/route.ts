import { NextResponse } from 'next/server'
import { runReminders } from '@/lib/reminders'

export async function GET(req: Request) {
  // Bez nastaveného CRON_SECRET by se porovnávalo s "Bearer undefined" a šlo by ho poslat zvenčí.
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET není nastavený' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runReminders()
  return NextResponse.json(result)
}
