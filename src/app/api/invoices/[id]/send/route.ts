import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { renderInvoiceHtml } from '@/lib/invoiceHtml'
import { renderPdfFromHtml } from '@/lib/pdfBrowser'
import { renderBrandedEmail } from '@/lib/emailTemplate'
import { escapeHtml as esc } from '@/lib/utils'
import { Resend } from 'resend'
import QRCode from 'qrcode'

// Puppeteer/Chromium potřebuje víc času než výchozích 10s, hlavně na cold startu
export const maxDuration = 30

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Chybí email' }, { status: 400 })

  const db = createServiceClient()
  const { data: invoice, error } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (error || !invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = invoice.invoice_items ?? []

  let qrCode: string | undefined
  if (invoice.sender_iban) {
    const iban = invoice.sender_iban.replace(/\s/g, '')
    const qrPayload = `SPD*1.0*ACC:${iban}*AM:${Number(invoice.total).toFixed(2)}*CC:${invoice.currency}*X-VS:${invoice.variable_symbol ?? ''}*MSG:Faktura ${invoice.invoice_number}`
    qrCode = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 })
  }

  try {
    const html = renderInvoiceHtml({ invoice, items, qrCode })
    const pdfBuffer = await renderPdfFromHtml(html)

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error: mailErr } = await resend.emails.send({
      from: 'Fakturo <info@fakturo.online>',
      to: email,
      replyTo: invoice.sender_email || undefined,
      subject: `Faktura č. ${invoice.invoice_number} od ${invoice.sender_name}`,
      html: renderBrandedEmail({
        senderName: invoice.sender_name,
        senderLogoUrl: invoice.sender_logo_url,
        bodyHtml: `
          <h2 style="font-size:20px;font-weight:700;margin:0 0 8px;color:#0c0c0e">Faktura č. ${esc(invoice.invoice_number)}</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px;line-height:1.55">
            Dobrý den,<br/>
            zasíláme vám fakturu od <strong>${esc(invoice.sender_name)}</strong>.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            <tr><td style="color:#64748b;padding:4px 0">Číslo faktury</td><td style="text-align:right;font-weight:600">${esc(invoice.invoice_number)}</td></tr>
            <tr><td style="color:#64748b;padding:4px 0">Datum splatnosti</td><td style="text-align:right;font-weight:600">${esc(invoice.due_date)}</td></tr>
            <tr><td style="color:#64748b;padding:4px 0">K úhradě</td><td style="text-align:right;font-weight:700;font-size:16px;color:#16a34a">${new Intl.NumberFormat('cs-CZ',{style:'currency',currency:invoice.currency}).format(invoice.total)}</td></tr>
          </table>
          ${invoice.public_token ? `
          <div style="text-align:center;margin:24px 0">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo.online'}/f/${invoice.public_token}" style="display:inline-block;background:#16a34a;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px">
              Zobrazit fakturu a zaplatit
            </a>
            <p style="color:#94a3b8;font-size:11px;margin-top:8px">QR platba a údaje k převodu</p>
          </div>` : ''}
          <p style="color:#94a3b8;font-size:12px;margin:0">Faktura je přiložena jako PDF.</p>
        `,
      }),
      attachments: [
        {
          filename: `faktura-${invoice.invoice_number}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    })

    if (mailErr) {
      console.error('[POST /api/invoices/[id]/send] Resend error:', mailErr)
      return NextResponse.json({ error: mailErr.message }, { status: 500 })
    }

    // Update client_email if not set
    if (!invoice.client_email && email) {
      await db.from('invoices').update({ client_email: email }).eq('id', params.id)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[POST /api/invoices/[id]/send] Error:', e)
    return NextResponse.json({ error: 'Nepodařilo se odeslat fakturu' }, { status: 500 })
  }
}
