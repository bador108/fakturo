import { NextResponse } from 'next/server'
import { calcTotals } from '@/lib/utils'

// Puppeteer/Chromium potřebuje víc než výchozích 10s, hlavně na cold startu
export const maxDuration = 30
import { renderInvoiceHtml } from '@/lib/invoiceHtml'
import { renderPdfFromHtml } from '@/lib/pdfBrowser'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import QRCode from 'qrcode'
import type { InvoiceFormData } from '@/types'

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MIN = 60

// Veřejný endpoint (generátor faktur zdarma bez registrace) — bez auth, ale s rate
// limitem (PDF render přes Puppeteer je drahá operace — bez limitu snadný DoS vektor)
// a základní validací vstupu, ať vadný request nespadne jako holý 500.
export async function POST(req: Request) {
  const ip = getClientIp(req)
  const allowed = await checkRateLimit('pdf_generate_requests', ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MIN)
  if (!allowed) {
    return NextResponse.json({ error: 'Příliš mnoho požadavků, zkuste to prosím za chvíli.' }, { status: 429 })
  }

  let form: InvoiceFormData
  try {
    form = await req.json() as InvoiceFormData
  } catch {
    return NextResponse.json({ error: 'Neplatný požadavek' }, { status: 400 })
  }

  if (!form?.sender_name || !form?.client_name || !Array.isArray(form.items) || form.items.length === 0) {
    return NextResponse.json({ error: 'Chybí dodavatel, odběratel nebo položky faktury' }, { status: 400 })
  }
  if (form.items.length > 100) {
    return NextResponse.json({ error: 'Příliš mnoho položek' }, { status: 400 })
  }

  try {
    const { subtotal, vat_amount, total } = calcTotals(form.items, form.vat_payer, form.reverse_charge)

    // Fake Invoice shape (nic se neukládá do DB, jen pro render PDF)
    const invoice = {
      id: '',
      user_id: '',
      invoice_number: form.invoice_number,
      invoice_type: form.invoice_type ?? 'faktura',
      status: 'draft' as const,
      sender_name: form.sender_name,
      sender_address: form.sender_address || null,
      sender_city: form.sender_city || null,
      sender_zip: form.sender_zip || null,
      sender_country: form.sender_country,
      sender_ico: form.sender_ico || null,
      sender_dic: form.sender_dic || null,
      sender_bank: form.sender_bank || null,
      sender_iban: form.sender_iban || null,
      sender_email: form.sender_email || null,
      sender_phone: form.sender_phone || null,
      client_name: form.client_name,
      client_address: form.client_address || null,
      client_city: form.client_city || null,
      client_zip: form.client_zip || null,
      client_country: form.client_country,
      client_ico: form.client_ico || null,
      client_dic: form.client_dic || null,
      issue_date: form.issue_date,
      duzp: form.duzp || form.issue_date,
      due_date: form.due_date,
      variable_symbol: form.variable_symbol || form.invoice_number?.replace(/\D/g, ''),
      payment_method: form.payment_method ?? 'bank_transfer',
      currency: form.currency,
      vat_payer: form.vat_payer,
      reverse_charge: form.reverse_charge,
      subtotal,
      vat_amount,
      total,
      notes: form.notes || null,
      accent_color: form.accent_color || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const items = form.items.map((item, i) => ({
      id: String(i),
      invoice_id: '',
      position: i,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      vat_rate: item.vat_rate ?? 21,
      total: item.quantity * item.unit_price,
    }))

    let qrCode: string | undefined
    if (form.sender_iban) {
      const iban = form.sender_iban.replace(/\s/g, '')
      const qrPayload = `SPD*1.0*ACC:${iban}*AM:${total.toFixed(2)}*CC:${form.currency}*X-VS:${invoice.variable_symbol ?? ''}*MSG:Faktura ${form.invoice_number}`
      qrCode = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 })
    }

    const html = renderInvoiceHtml({ invoice, items, qrCode })
    const pdfBuffer = await renderPdfFromHtml(html)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${form.invoice_number}.pdf"`,
      },
    })
  } catch (e) {
    console.error('[POST /api/pdf/generate] Error:', e)
    return NextResponse.json({ error: 'Nepodařilo se vygenerovat PDF' }, { status: 500 })
  }
}
