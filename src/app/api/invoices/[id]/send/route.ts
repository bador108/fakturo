import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServiceClient } from '@/lib/supabase'
import { InvoicePDF } from '@/components/invoice/InvoicePDF'
import { Resend } from 'resend'
import React from 'react'
import QRCode from 'qrcode'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, includePaymentLink } = await req.json()
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
    const qrPayload = `SPD*1.0*ACC:${iban}*AM:${Number(invoice.total).toFixed(2)}*CC:${invoice.currency}*MSG:Faktura ${invoice.invoice_number}`
    qrCode = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoicePDF as any, { invoice, items, qrCode }) as any
  const pdfBuffer = await renderToBuffer(element)

  // Optionally create Stripe payment link
  let paymentUrl: string | null = null
  if (includePaymentLink && process.env.STRIPE_SECRET_KEY) {
    try {
      const linkRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'}/api/invoices/${params.id}/payment-link`, {
        method: 'POST',
        headers: { Cookie: req.headers.get('cookie') ?? '' },
      })
      if (linkRes.ok) {
        const linkData = await linkRes.json()
        paymentUrl = linkData.url
      }
    } catch {
      // Payment link is optional, continue without it
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error: mailErr } = await resend.emails.send({
    from: 'Fakturo <faktury@fakturo.cz>',
    to: email,
    subject: `Faktura č. ${invoice.invoice_number} od ${invoice.sender_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Faktura č. ${invoice.invoice_number}</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
          Dobrý den,<br/>
          zasíláme vám fakturu od <strong>${invoice.sender_name}</strong>.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <tr><td style="color:#64748b;padding:4px 0">Číslo faktury</td><td style="text-align:right;font-weight:600">${invoice.invoice_number}</td></tr>
          <tr><td style="color:#64748b;padding:4px 0">Datum splatnosti</td><td style="text-align:right;font-weight:600">${invoice.due_date}</td></tr>
          <tr><td style="color:#64748b;padding:4px 0">K úhradě</td><td style="text-align:right;font-weight:700;font-size:16px;color:#4f46e5">${new Intl.NumberFormat('cs-CZ',{style:'currency',currency:invoice.currency}).format(invoice.total)}</td></tr>
        </table>
        ${paymentUrl ? `
        <div style="text-align:center;margin:24px 0">
          <a href="${paymentUrl}" style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px">
            Zaplatit online kartou
          </a>
          <p style="color:#94a3b8;font-size:11px;margin-top:8px">Bezpečná platba kartou přes Stripe</p>
        </div>` : ''}
        <p style="color:#94a3b8;font-size:12px;">Faktura je přiložena jako PDF. Vystaveno přes <a href="https://fakturo-seven.vercel.app" style="color:#4f46e5">Fakturo</a>.</p>
      </div>
    `,
    attachments: [
      {
        filename: `faktura-${invoice.invoice_number}.pdf`,
        content: Buffer.from(pdfBuffer),
      },
    ],
  })

  if (mailErr) return NextResponse.json({ error: mailErr.message }, { status: 500 })

  // Update client_email if not set
  if (!invoice.client_email && email) {
    await db.from('invoices').update({ client_email: email }).eq('id', params.id)
  }

  return NextResponse.json({ success: true })
}
