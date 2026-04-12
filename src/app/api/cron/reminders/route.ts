import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const today = new Date().toISOString().slice(0, 10)
  let sent = 0

  // Get all sent invoices that are overdue or near due
  const { data: invoices } = await db
    .from('invoices')
    .select('id, invoice_number, client_name, client_email, total, currency, due_date, user_id')
    .eq('status', 'sent')
    .lte('due_date', new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10))

  if (!invoices?.length) return NextResponse.json({ sent: 0 })

  // Get user reminder settings
  const userIds = Array.from(new Set(invoices.map(i => i.user_id)))
  const { data: users } = await db
    .from('users')
    .select('id, email, reminder_days')
    .in('id', userIds)

  const userMap = new Map((users ?? []).map(u => [u.id, u]))

  for (const inv of invoices) {
    if (!inv.client_email) continue

    const user = userMap.get(inv.user_id)
    if (!user) continue

    const reminderDays: number[] = user.reminder_days ?? [3, 7, 14]
    const dueDate = new Date(inv.due_date)
    const diffDays = Math.round((dueDate.getTime() - new Date(today).getTime()) / 86400000)

    // Send reminder if today is exactly N days before due (negative = overdue)
    const triggerOffset = reminderDays.find(d => -diffDays === d || diffDays === d)
    if (triggerOffset === undefined) continue

    // Check if reminder already sent for this offset
    const { data: alreadySent } = await db
      .from('invoice_reminders')
      .select('id')
      .eq('invoice_id', inv.id)
      .eq('days_offset', -diffDays)
      .single()

    if (alreadySent) continue

    const isOverdue = diffDays < 0
    const subject = isOverdue
      ? `Upomínka: Faktura č. ${inv.invoice_number} je ${Math.abs(diffDays)} dní po splatnosti`
      : `Připomínka: Faktura č. ${inv.invoice_number} je splatná za ${diffDays} dní`

    const { error: mailErr } = await resend.emails.send({
      from: 'Fakturo <onboarding@resend.dev>',
      to: inv.client_email,
      replyTo: user.email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1e293b">
          <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">${subject}</h2>
          <p style="color:#64748b;font-size:14px;margin-bottom:24px">
            Dobrý den,<br/>
            ${isOverdue
              ? `upozorňujeme vás, že faktura č. <strong>${inv.invoice_number}</strong> od <strong>${inv.client_name ? 'nás' : ''}</strong> je již ${Math.abs(diffDays)} dní po datu splatnosti.`
              : `připomínáme vám, že faktura č. <strong>${inv.invoice_number}</strong> bude splatná za ${diffDays} dní.`
            }
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            <tr><td style="color:#64748b;padding:4px 0">Číslo faktury</td><td style="text-align:right;font-weight:600">${inv.invoice_number}</td></tr>
            <tr><td style="color:#64748b;padding:4px 0">Datum splatnosti</td><td style="text-align:right;font-weight:600">${inv.due_date}</td></tr>
            <tr><td style="color:#64748b;padding:4px 0">K úhradě</td><td style="text-align:right;font-weight:700;font-size:16px;color:#dc2626">${new Intl.NumberFormat('cs-CZ',{style:'currency',currency:inv.currency}).format(inv.total)}</td></tr>
          </table>
          <p style="color:#94a3b8;font-size:12px">Vystaveno přes <a href="https://fakturo.cz" style="color:#4f46e5">Fakturo</a>.</p>
        </div>
      `,
    })

    if (!mailErr) {
      await db.from('invoice_reminders').insert({
        invoice_id: inv.id,
        days_offset: -diffDays,
      })
      sent++
    }
  }

  return NextResponse.json({ sent })
}
