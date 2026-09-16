import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'
import { escapeHtml as esc } from '@/lib/utils'
import { renderBrandedEmail } from '@/lib/emailTemplate'
import { Resend } from 'resend'

/** Projde odeslané faktury blízko/po splatnosti a pošle upomínky klientům (Pro funkce). */
export async function runReminders(): Promise<{ sent: number }> {
  const db = createServiceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const today = new Date().toISOString().slice(0, 10)
  let sent = 0

  const { data: invoices } = await db
    .from('invoices')
    .select('id, invoice_number, client_name, client_email, total, currency, due_date, user_id, sender_name, sender_logo_url')
    .eq('status', 'sent')
    .lte('due_date', new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10))

  if (!invoices?.length) return { sent: 0 }

  const userIds = Array.from(new Set(invoices.map(i => i.user_id)))
  const { data: users } = await db
    .from('users')
    .select('id, email, plan, reminder_days')
    .in('id', userIds)

  const userMap = new Map((users ?? []).map(u => [u.id, u]))

  for (const inv of invoices) {
    if (!inv.client_email) continue

    const user = userMap.get(inv.user_id)
    if (!user) continue
    if (!isPro(getEffectivePlan(user.plan, user.email))) continue // Upomínky jsou Pro funkce

    const reminderDays: number[] = user.reminder_days ?? [3, 7, 14]
    const dueDate = new Date(inv.due_date)
    const diffDays = Math.round((dueDate.getTime() - new Date(today).getTime()) / 86400000)

    const triggerOffset = reminderDays.find(d => -diffDays === d || diffDays === d)
    if (triggerOffset === undefined) continue

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
      from: 'Fakturo <info@fakturo.online>',
      to: inv.client_email,
      replyTo: user.email,
      subject,
      html: renderBrandedEmail({
        senderName: inv.sender_name,
        senderLogoUrl: inv.sender_logo_url,
        bodyHtml: `
          <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;color:#0c0c0e">${esc(subject)}</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px;line-height:1.55">
            Dobrý den,<br/>
            ${isOverdue
              ? `upozorňujeme vás, že faktura č. <strong>${esc(inv.invoice_number)}</strong> od <strong>${esc(inv.sender_name)}</strong> je již ${Math.abs(diffDays)} dní po datu splatnosti.`
              : `připomínáme vám, že faktura č. <strong>${esc(inv.invoice_number)}</strong> od <strong>${esc(inv.sender_name)}</strong> bude splatná za ${diffDays} dní.`
            }
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:0">
            <tr><td style="color:#64748b;padding:4px 0">Číslo faktury</td><td style="text-align:right;font-weight:600">${esc(inv.invoice_number)}</td></tr>
            <tr><td style="color:#64748b;padding:4px 0">Datum splatnosti</td><td style="text-align:right;font-weight:600">${esc(inv.due_date)}</td></tr>
            <tr><td style="color:#64748b;padding:4px 0">K úhradě</td><td style="text-align:right;font-weight:700;font-size:16px;color:#dc2626">${new Intl.NumberFormat('cs-CZ',{style:'currency',currency:inv.currency}).format(inv.total)}</td></tr>
          </table>
        `,
      }),
    })

    if (!mailErr) {
      await db.from('invoice_reminders').insert({
        invoice_id: inv.id,
        days_offset: -diffDays,
      })
      sent++
    }
  }

  return { sent }
}
