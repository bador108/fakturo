import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoice/InvoicePDF'
import { calcTotals } from '@/lib/utils'
import React from 'react'
import QRCode from 'qrcode'
import type { InvoiceFormData } from '@/types'

// Public endpoint — no auth, just generate PDF from posted form data
export async function POST(req: Request) {
  const form = await req.json() as InvoiceFormData

  const { subtotal, vat_amount, total } = calcTotals(form.items, form.vat_rate)

  // Build fake Invoice shape for InvoicePDF
  const invoice = {
    id: '',
    user_id: '',
    invoice_number: form.invoice_number,
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
    issue_date: form.issue_date,
    due_date: form.due_date,
    currency: form.currency,
    vat_rate: form.vat_rate,
    subtotal,
    vat_amount,
    total,
    notes: form.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const items = form.items.map((item, i) => ({
    id: String(i),
    invoice_id: '',
    position: i,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price,
  }))

  let qrCode: string | undefined
  if (form.sender_iban) {
    const iban = form.sender_iban.replace(/\s/g, '')
    const qrPayload = `SPD*1.0*ACC:${iban}*AM:${total.toFixed(2)}*CC:${form.currency}*MSG:Faktura ${form.invoice_number}`
    qrCode = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoicePDF as any, { invoice, items, qrCode }) as any
  const pdfBuffer = await renderToBuffer(element)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="faktura-${form.invoice_number}.pdf"`,
    },
  })
}
