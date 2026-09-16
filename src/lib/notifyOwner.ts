import { Resend } from 'resend'
import { escapeHtml as esc } from '@/lib/utils'

// Resend účet běží v testovacím módu (doména fakturo.online zatím není v Resendu
// ověřená) — v tomhle módu Resend povolí posílat jen na email, kterým je Resend
// účet zaregistrovaný. Tenhle musí přesně sedět, jinak celý request spadne na 403.
const SUPPORT_NOTIFY_EMAIL = 'fakturosupport@gmail.com'

/** Best-effort emailová notifikace o nové zprávě v inbox_messages. Nikdy nevyhodí chybu. */
export async function notifyOwner(subject: string, fromLabel: string, message: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Fakturo <info@fakturo.online>',
      to: SUPPORT_NOTIFY_EMAIL,
      subject: `[Fakturo] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${esc(subject)}</h2>
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px;">Od: ${esc(fromLabel)}</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; font-size: 14px; white-space: pre-wrap;">${esc(message)}</div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Celý přehled: fakturo.online/zpravy</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('notifyOwner: send failed:', err)
  }
}
