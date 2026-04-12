import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Auto-generate overdue notifications for invoices past due_date
async function syncOverdueNotifications(userId: string) {
  const db = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  // Find overdue invoices (sent + due_date < today)
  const { data: overdue } = await db
    .from('invoices')
    .select('id, invoice_number, client_name, due_date, total, currency')
    .eq('user_id', userId)
    .eq('status', 'sent')
    .lt('due_date', today)

  if (!overdue?.length) return

  // For each overdue invoice, upsert a notification (avoid duplicates)
  for (const inv of overdue) {
    const { data: existing } = await db
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('invoice_id', inv.id)
      .eq('type', 'overdue')
      .single()

    if (!existing) {
      await db.from('notifications').insert({
        user_id: userId,
        type: 'overdue',
        title: 'Faktura po splatnosti',
        message: `Faktura #${inv.invoice_number} pro ${inv.client_name} je po splatnosti (${inv.due_date}).`,
        invoice_id: inv.id,
      })
    }
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await syncOverdueNotifications(userId)

  const db = createServiceClient()
  const { data } = await db
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  return NextResponse.json(data ?? [])
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const db = createServiceClient()

  if (body.readAll) {
    await db.from('notifications').update({ read: true }).eq('user_id', userId)
  } else if (body.id) {
    await db.from('notifications').update({ read: true }).eq('id', body.id).eq('user_id', userId)
  }

  return NextResponse.json({ success: true })
}
