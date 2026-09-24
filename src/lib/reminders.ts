import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'
import { escapeHtml as esc, formatCurrency, formatDate } from '@/lib/utils'
import { renderBrandedEmail } from '@/lib/emailTemplate'
import { DEFAULT_REMINDER_DAYS, DEFAULT_REMINDER_TONE, isReminderTone, reminderCopy, type ReminderCopy } from '@/lib/reminderConfig'
import { Resend } from 'resend'

interface ReminderInvoice {
  invoice_number: string
  total: number
  currency: string
  due_date: string
  public_token: string | null
}

function reminderBodyHtml(inv: ReminderInvoice, copy: ReminderCopy, overdue: boolean): string {
  const link = inv.public_token
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo.online'}/f/${inv.public_token}`
    : null
  return `
    <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;color:#0c0c0e">${esc(copy.subject)}</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 12px;line-height:1.55">Dobrý den,<br/>${esc(copy.intro)}</p>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;line-height:1.55">${esc(copy.outro)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:0">
      <tr><td style="color:#64748b;padding:4px 0">Číslo faktury</td><td style="text-align:right;font-weight:600">${esc(inv.invoice_number)}</td></tr>
      <tr><td style="color:#64748b;padding:4px 0">Datum splatnosti</td><td style="text-align:right;font-weight:600">${esc(formatDate(inv.due_date))}</td></tr>
      <tr><td style="color:#64748b;padding:4px 0">K úhradě</td><td style="text-align:right;font-weight:700;font-size:16px;color:${overdue ? '#dc2626' : '#0c0c0e'}">${esc(formatCurrency(inv.total, inv.currency))}</td></tr>
    </table>
    ${link ? `
    <div style="text-align:center;margin:24px 0 0">
      <a href="${esc(link)}" style="display:inline-block;background:#16a34a;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px">
        Zobrazit fakturu a zaplatit
      </a>
      <p style="color:#94a3b8;font-size:11px;margin-top:8px">QR platba a údaje k převodu</p>
    </div>` : ''}
  `
}

/** Projde odeslané faktury blízko/po splatnosti a pošle klientům upomínky e-mailem (Pro funkce). */
export async function runReminders(): Promise<{ sent: number }> {
  const db = createServiceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const today = new Date().toISOString().slice(0, 10)
  let sent = 0

  const { data: invoices } = await db
    .from('invoices')
    .select('id, invoice_number, client_name, client_email, total, currency, due_date, public_token, user_id, sender_name, sender_logo_url')
    .eq('status', 'sent')
    .lte('due_date', new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10))

  if (!invoices?.length) return { sent: 0 }

  const userIds = Array.from(new Set(invoices.map(i => i.user_id)))
  const { data: users } = await db
    .from('users')
    .select('id, email, plan, reminder_days, reminder_tone')
    .in('id', userIds)

  const userMap = new Map((users ?? []).map(u => [u.id, u]))

  for (const inv of invoices) {
    if (!inv.client_email) continue

    const user = userMap.get(inv.user_id)
    if (!user) continue
    if (!isPro(getEffectivePlan(user.plan, user.email))) continue // Upomínky jsou Pro funkce

    // kladné = dní před splatností, záporné = dní po splatnosti (stejně jako v Nastavení)
    const reminderDays: number[] = user.reminder_days ?? DEFAULT_REMINDER_DAYS
    const diffDays = Math.round((new Date(inv.due_date).getTime() - new Date(today).getTime()) / 86400000)
    if (!reminderDays.includes(diffDays)) continue

    const { data: alreadySent } = await db
      .from('invoice_reminders')
      .select('id')
      .eq('invoice_id', inv.id)
      .eq('days_offset', -diffDays)
      .single()

    if (alreadySent) continue

    const tone = isReminderTone(user.reminder_tone) ? user.reminder_tone : DEFAULT_REMINDER_TONE
    const copy = reminderCopy({ tone, invoiceNumber: inv.invoice_number, senderName: inv.sender_name, daysToDue: diffDays })

    const { error: mailErr } = await resend.emails.send({
      from: 'Fakturo <info@fakturo.online>',
      to: inv.client_email,
      replyTo: user.email,
      subject: copy.subject,
      html: renderBrandedEmail({
        senderName: inv.sender_name,
        senderLogoUrl: inv.sender_logo_url,
        bodyHtml: reminderBodyHtml(inv, copy, diffDays < 0),
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
