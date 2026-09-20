import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { renderInvoiceHtml } from '@/lib/invoiceHtml'
import { renderPdfFromHtml } from '@/lib/pdfBrowser'
import { buildQrPayload, PUBLIC_TOKEN_RE } from '@/lib/invoiceQr'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import QRCode from 'qrcode'

// Puppeteer/Chromium potřebuje víc času než výchozích 10s, hlavně na cold startu
export const maxDuration = 30

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MIN = 60

// PDF faktury pro klienta z veřejného odkazu (/f/<token>). Bez přihlášení, takže je
// omezené podle IP — generování PDF přes Chromium je drahé.
export async function GET(req: Request, { params }: { params: { token: string } }) {
  if (!PUBLIC_TOKEN_RE.test(params.token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed = await checkRateLimit('pdf_generate_requests', getClientIp(req), RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MIN)
  if (!allowed) return NextResponse.json({ error: 'Příliš mnoho stažení, zkuste to prosím za chvíli.' }, { status: 429 })

  const db = createServiceClient()
  const { data: invoice } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('public_token', params.token)
    .single()

  if (!invoice || invoice.status === 'draft') return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = invoice.invoice_items ?? []
  const qrPayload = buildQrPayload(invoice)
  const qrCode = qrPayload ? await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 }) : undefined

  try {
    const pdfBuffer = await renderPdfFromHtml(renderInvoiceHtml({ invoice, items, qrCode }))
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e) {
    console.error('[GET /api/pdf/public/[token]] Error:', e)
    return NextResponse.json({ error: 'Nepodařilo se vygenerovat PDF' }, { status: 500 })
  }
}
