import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServiceClient } from '@/lib/supabase'
import { InvoicePDF } from '@/components/invoice/InvoicePDF'
import React from 'react'
import QRCode from 'qrcode'

function buildQrPayload(invoice: { sender_iban?: string | null; total: number; currency: string; invoice_number: string }): string | null {
  if (!invoice.sender_iban) return null
  const iban = invoice.sender_iban.replace(/\s/g, '')
  const amount = Number(invoice.total).toFixed(2)
  return `SPD*1.0*ACC:${iban}*AM:${amount}*CC:${invoice.currency}*MSG:Faktura ${invoice.invoice_number}`
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: invoice, error } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (error || !invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = invoice.invoice_items ?? []

  // Generate QR code if IBAN is available
  let qrCode: string | undefined
  const qrPayload = buildQrPayload(invoice)
  if (qrPayload) {
    qrCode = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoicePDF as any, { invoice, items, qrCode }) as any
  const pdfBuffer = await renderToBuffer(element)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="faktura-${invoice.invoice_number}.pdf"`,
    },
  })
}
