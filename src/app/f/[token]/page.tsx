import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { FileDown } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase'
import { buildQrPayload, PUBLIC_TOKEN_RE } from '@/lib/invoiceQr'
import { calcTotals, formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/badge'
import { CopyButton } from '@/components/CopyButton'
import type { Invoice, InvoiceItem } from '@/types'

// Stránka je pro klienta konkrétní faktury, nemá se dostat do vyhledávačů ani prosakovat přes referrer.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Faktura – Fakturo',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

const TYPE_LABEL: Record<string, string> = {
  faktura: 'Faktura',
  zalohova: 'Zálohová faktura',
  opravny: 'Opravný doklad',
  nabidka: 'Cenová nabídka',
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="flex items-center gap-1 text-sm font-medium text-slate-900 text-right">
        {value}
        {copy && <CopyButton value={value} />}
      </span>
    </div>
  )
}

function Party({ title, name, lines }: { title: string; name: string; lines: (string | undefined | null)[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{title}</p>
      <p className="font-semibold text-slate-900">{name}</p>
      {lines.filter(Boolean).map((line, i) => (
        <p key={i} className="text-sm text-slate-500 leading-relaxed">{line}</p>
      ))}
    </div>
  )
}

export default async function PublicInvoicePage({ params }: { params: { token: string } }) {
  if (!PUBLIC_TOKEN_RE.test(params.token)) notFound()

  const db = createServiceClient()
  const { data } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('public_token', params.token)
    .single()

  if (!data || data.status === 'draft') notFound()

  const invoice = data as Invoice & { invoice_items: InvoiceItem[] }
  const items = [...(invoice.invoice_items ?? [])].sort((a, b) => a.position - b.position)
  const { vatBreakdown } = calcTotals(items, invoice.vat_payer, invoice.reverse_charge)

  const isOffer = invoice.invoice_type === 'nabidka'
  const needsPayment = !isOffer && invoice.status !== 'paid' && invoice.status !== 'cancelled'
  const qrPayload = needsPayment ? buildQrPayload(invoice) : null
  const qrDataUrl = qrPayload ? await QRCode.toDataURL(qrPayload, { width: 240, margin: 1 }) : null
  const showBankBlock = needsPayment && Boolean(invoice.sender_iban || invoice.sender_bank)

  const senderAddress = [invoice.sender_address, [invoice.sender_zip, invoice.sender_city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  const clientAddress = [invoice.client_address, [invoice.client_zip, invoice.client_city].filter(Boolean).join(' ')].filter(Boolean).join(', ')

  return (
    <main className="min-h-screen bg-slate-50 py-8 md:py-14 px-4">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          {invoice.sender_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invoice.sender_logo_url} alt={invoice.sender_name} className="max-h-10 max-w-[200px] object-contain" />
          ) : (
            <span className="font-semibold text-slate-900">{invoice.sender_name}</span>
          )}
          <a
            href={`/api/pdf/public/${params.token}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <FileDown className="h-4 w-4" />
            Stáhnout PDF
          </a>
        </header>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">{TYPE_LABEL[invoice.invoice_type] ?? 'Faktura'} č. {invoice.invoice_number}</p>
              <p className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                {formatCurrency(Number(invoice.total), invoice.currency)}
              </p>
            </div>
            <StatusBadge status={invoice.status} dueDate={invoice.due_date} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-400">Vystaveno</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{formatDate(invoice.issue_date)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{isOffer ? 'Platnost do' : 'Splatnost'}</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{formatDate(invoice.due_date)}</dd>
            </div>
          </dl>
        </section>

        {showBankBlock && (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Jak zaplatit</h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {qrDataUrl && (
                <div className="shrink-0 self-center md:self-start text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="QR platba" width={200} height={200} className="rounded-lg border border-slate-100" />
                  <p className="mt-2 text-xs text-slate-400">Naskenuj v bankovní aplikaci</p>
                </div>
              )}
              <div className="flex-1 min-w-0">
                {invoice.sender_bank && <Row label="Číslo účtu" value={invoice.sender_bank} copy />}
                {invoice.sender_iban && <Row label="IBAN" value={invoice.sender_iban} copy />}
                <Row label="Částka" value={formatCurrency(Number(invoice.total), invoice.currency)} />
                {invoice.variable_symbol && <Row label="Variabilní symbol" value={invoice.variable_symbol} copy />}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Party
              title="Dodavatel"
              name={invoice.sender_name}
              lines={[senderAddress, invoice.sender_ico && `IČO: ${invoice.sender_ico}`, invoice.sender_dic && `DIČ: ${invoice.sender_dic}`, invoice.sender_email]}
            />
            <Party
              title="Odběratel"
              name={invoice.client_name}
              lines={[clientAddress, invoice.client_ico && `IČO: ${invoice.client_ico}`, invoice.client_dic && `DIČ: ${invoice.client_dic}`]}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Položka</th>
                  <th className="pb-2 font-medium text-right whitespace-nowrap">Množství</th>
                  <th className="pb-2 font-medium text-right whitespace-nowrap pl-4">Cena</th>
                  {invoice.vat_payer && <th className="pb-2 font-medium text-right pl-4">DPH</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id ?? i} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 text-slate-900">{item.description}</td>
                    <td className="py-3 text-right text-slate-600 whitespace-nowrap">{item.quantity} {item.unit}</td>
                    <td className="py-3 text-right text-slate-900 whitespace-nowrap pl-4">
                      {formatCurrency(Number(item.quantity) * Number(item.unit_price), invoice.currency)}
                    </td>
                    {invoice.vat_payer && <td className="py-3 text-right text-slate-500 pl-4">{item.vat_rate} %</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto w-full sm:w-72 space-y-1.5 text-sm">
            {invoice.vat_payer &&
              vatBreakdown.map(b => (
                <div key={b.rate} className="flex justify-between text-slate-500">
                  <span>Základ {b.rate} %</span>
                  <span>{formatCurrency(b.base, invoice.currency)}</span>
                </div>
              ))}
            {invoice.vat_payer && Number(invoice.vat_amount) > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>DPH</span>
                <span>{formatCurrency(Number(invoice.vat_amount), invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-semibold text-slate-900">
              <span>Celkem</span>
              <span>{formatCurrency(Number(invoice.total), invoice.currency)}</span>
            </div>
          </div>

          {invoice.notes && <p className="text-sm text-slate-500 whitespace-pre-line border-t border-slate-100 pt-4">{invoice.notes}</p>}
        </section>

        <p className="text-center text-xs text-slate-400 pt-2">
          Vystaveno přes <Link href="/" className="underline underline-offset-2 hover:text-slate-600">Fakturo</Link>
        </p>
      </div>
    </main>
  )
}
