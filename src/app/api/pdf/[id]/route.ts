import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { renderInvoiceHtml } from '@/lib/invoiceHtml'
import { renderPdfFromHtml } from '@/lib/pdfBrowser'
import { buildQrPayload } from '@/lib/invoiceQr'
import QRCode from 'qrcode'

// Puppeteer/Chromium potřebuje víc času než výchozích 10s, hlavně na cold startu
export const maxDuration = 30

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

  let qrCode: string | undefined
  const qrPayload = buildQrPayload(invoice)
  if (qrPayload) {
    qrCode = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 })
  }

  try {
    const html = renderInvoiceHtml({ invoice, items, qrCode })
    const pdfBuffer = await renderPdfFromHtml(html)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (e) {
    console.error('[GET /api/pdf/[id]] Error:', e)
    return NextResponse.json({ error: 'Nepodařilo se vygenerovat PDF' }, { status: 500 })
  }
}
