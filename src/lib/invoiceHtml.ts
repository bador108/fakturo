import fs from 'fs'
import path from 'path'
import type { Invoice, InvoiceItem } from '@/types'
import { formatDate, formatCurrency, calcTotals } from '@/lib/utils'

// @react-pdf/renderer (fontkit 2.0.4) mělo neopravitelný bug v subsettingu — určité
// české znaky (ř,ž,ě,ů,í) se vykreslily poškozené i s korektním fontem. Puppeteer
// (skutečný prohlížeč) tenhle problém nemá, protože text vykresluje jako normální HTML.
let fontCache: { regular: string; bold: string } | null = null
function getFontDataUris() {
  if (fontCache) return fontCache
  const dir = path.join(process.cwd(), 'src/fonts')
  const regular = fs.readFileSync(path.join(dir, 'NotoSans-Regular.ttf')).toString('base64')
  const bold = fs.readFileSync(path.join(dir, 'NotoSans-Bold.ttf')).toString('base64')
  fontCache = {
    regular: `data:font/ttf;base64,${regular}`,
    bold: `data:font/ttf;base64,${bold}`,
  }
  return fontCache
}

function esc(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const invoiceTypeLabel: Record<string, string> = {
  faktura: 'Faktura – daňový doklad',
  zalohova: 'Zálohová faktura',
  opravny: 'Opravný daňový doklad',
  nabidka: 'Cenová nabídka',
}

const paymentMethodLabel: Record<string, string> = {
  bank_transfer: 'Bankovní převod',
  cash: 'Hotovost',
  card: 'Platební karta',
}

interface RenderOptions {
  invoice: Invoice
  items: InvoiceItem[]
  qrCode?: string
}

export function renderInvoiceHtml({ invoice, items, qrCode }: RenderOptions): string {
  const { regular, bold } = getFontDataUris()
  const currency = invoice.currency
  const { vatBreakdown } = calcTotals(
    items.map(i => ({ description: i.description, quantity: i.quantity, unit: i.unit, unit_price: i.unit_price, vat_rate: i.vat_rate })),
    invoice.vat_payer,
    invoice.reverse_charge
  )

  const partyLines = (lines: (string | null | undefined)[]) =>
    lines.filter(Boolean).map(l => `<div class="party-line">${esc(l)}</div>`).join('')

  const senderCityLine = [invoice.sender_zip, invoice.sender_city].filter(Boolean).join(' ')
  const clientCityLine = [invoice.client_zip, invoice.client_city].filter(Boolean).join(' ')

  const itemRows = items.map((item, i) => `
    <tr class="${i % 2 === 1 ? 'alt' : ''}">
      <td class="col-desc">${esc(item.description)}</td>
      <td class="col-qty">${esc(item.quantity)}</td>
      <td class="col-unit">${esc(item.unit)}</td>
      <td class="col-price">${esc(formatCurrency(item.unit_price, currency))}</td>
      ${invoice.vat_payer ? `<td class="col-vat">${esc(item.vat_rate)} %</td>` : ''}
      <td class="col-total">${esc(formatCurrency(item.total ?? item.quantity * item.unit_price, currency))}</td>
    </tr>
  `).join('')

  const vatRows = (!invoice.vat_payer || invoice.reverse_charge)
    ? ''
    : vatBreakdown.map(b => `
      <div class="total-row">
        <span class="total-label">DPH (${b.rate} %)</span>
        <span class="total-value">${esc(formatCurrency(b.vat, currency))}</span>
      </div>
    `).join('')

  const legalNotice = !invoice.vat_payer
    ? '<p class="legal-notice">Dodavatel není plátcem DPH.</p>'
    : (invoice.reverse_charge
      ? '<p class="legal-notice">Daň odvede zákazník (přenesená daňová povinnost, § 92a zákona o DPH).</p>'
      : '')

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Noto Sans'; src: url(${regular}) format('truetype'); font-weight: 400; }
  @font-face { font-family: 'Noto Sans'; src: url(${bold}) format('truetype'); font-weight: 700; }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Noto Sans', sans-serif;
    font-size: 9.5pt;
    color: #18181B;
    padding: 48px;
  }
  .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
  .sender-name { font-size: 19pt; font-weight: 700; color: #18181B; letter-spacing: -0.2px; margin: 0; }
  .invoice-label { font-size: 10.5pt; font-weight: 700; color: #4F46E5; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.8px; }
  .invoice-number { font-size: 12pt; color: #71717A; margin-top: 1px; }
  .meta-block { text-align: right; }
  .meta-row { display: flex; gap: 14px; margin-top: 6px; justify-content: flex-end; flex-wrap: wrap; }
  .meta-item { display: flex; flex-direction: column; gap: 2px; }
  .meta-label { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-value { font-size: 9.5pt; font-weight: 700; }
  .meta-value.accent { color: #4F46E5; }

  .parties { display: flex; gap: 24px; margin-bottom: 28px; }
  .party-box { flex: 1; background: #FAFAFA; border-radius: 6px; padding: 14px; }
  .party-title { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
  .party-name { font-size: 11.5pt; font-weight: 700; margin-bottom: 4px; }
  .party-line { font-size: 9.5pt; color: #71717A; line-height: 1.5; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead tr { background: #4F46E5; }
  thead th { color: #fff; font-size: 8.5pt; font-weight: 700; padding: 7px 10px; text-align: left; }
  tbody td { font-size: 9.5pt; padding: 7px 10px; border-bottom: 1px solid #E4E4E7; }
  tbody tr.alt { background: #F4F4F5; }
  .col-qty, .col-price, .col-vat, .col-total { text-align: right; white-space: nowrap; }
  .col-unit { text-align: center; }

  .totals { display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 10px; }
  .total-row { display: flex; gap: 16px; margin-bottom: 3px; min-width: 220px; justify-content: space-between; }
  .total-label { color: #71717A; }
  .grand-total { display: flex; justify-content: space-between; gap: 16px; min-width: 220px; background: #4F46E5; color: #fff; font-weight: 700; font-size: 11pt; padding: 8px 14px; border-radius: 4px; margin-top: 4px; }

  .legal-notice { font-size: 8.5pt; color: #B45309; margin-bottom: 20px; }

  .qr-block { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
  .qr-block img { width: 72px; height: 72px; }
  .qr-label { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .qr-text { font-size: 8.5pt; }
  .qr-text.muted { color: #71717A; margin-top: 4px; }

  .notes-box { background: #FAFAFA; border-radius: 6px; padding: 12px; margin-bottom: 24px; }
  .notes-label { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
  .notes-text { font-size: 9.5pt; line-height: 1.6; white-space: pre-wrap; }

  .footer { border-top: 1px solid #E4E4E7; padding-top: 10px; display: flex; justify-content: space-between; font-size: 8.5pt; color: #71717A; }
</style>
</head>
<body>

  <div class="header">
    <div>
      <p class="sender-name">${esc(invoice.sender_name)}</p>
      <div class="invoice-label">${esc(invoiceTypeLabel[invoice.invoice_type] ?? 'Faktura')}</div>
      <div class="invoice-number">č. ${esc(invoice.invoice_number)}</div>
    </div>
    <div class="meta-block">
      <div class="meta-row">
        <div class="meta-item"><span class="meta-label">Vystaveno</span><span class="meta-value">${esc(formatDate(invoice.issue_date))}</span></div>
        <div class="meta-item"><span class="meta-label">DUZP</span><span class="meta-value">${esc(formatDate(invoice.duzp || invoice.issue_date))}</span></div>
        <div class="meta-item"><span class="meta-label">Splatnost</span><span class="meta-value accent">${esc(formatDate(invoice.due_date))}</span></div>
      </div>
      <div class="meta-row">
        ${invoice.variable_symbol ? `<div class="meta-item"><span class="meta-label">Variabilní symbol</span><span class="meta-value">${esc(invoice.variable_symbol)}</span></div>` : ''}
        <div class="meta-item"><span class="meta-label">Způsob úhrady</span><span class="meta-value">${esc(paymentMethodLabel[invoice.payment_method ?? 'bank_transfer'])}</span></div>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <div class="party-title">Dodavatel</div>
      <div class="party-name">${esc(invoice.sender_name)}</div>
      ${partyLines([invoice.sender_address, senderCityLine || null, invoice.sender_ico ? `IČO: ${invoice.sender_ico}` : null, invoice.sender_dic ? `DIČ: ${invoice.sender_dic}` : null, invoice.sender_bank ? `Účet: ${invoice.sender_bank}` : null, invoice.sender_email, invoice.sender_phone])}
    </div>
    <div class="party-box">
      <div class="party-title">Odběratel</div>
      <div class="party-name">${esc(invoice.client_name)}</div>
      ${partyLines([invoice.client_address, clientCityLine || null, invoice.client_ico ? `IČO: ${invoice.client_ico}` : null, invoice.client_dic ? `DIČ: ${invoice.client_dic}` : null])}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="col-desc">Popis</th>
        <th class="col-qty">Množ.</th>
        <th class="col-unit">Jedn.</th>
        <th class="col-price">Cena/jedn.</th>
        ${invoice.vat_payer ? '<th class="col-vat">DPH</th>' : ''}
        <th class="col-total">Celkem</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span class="total-label">Základ DPH</span><span>${esc(formatCurrency(invoice.subtotal, currency))}</span></div>
    ${vatRows}
    <div class="grand-total"><span>K ÚHRADĚ</span><span>${esc(formatCurrency(invoice.total, currency))}</span></div>
  </div>

  ${legalNotice}

  ${qrCode ? `
  <div class="qr-block">
    <img src="${qrCode}" alt="QR platba" />
    <div>
      <div class="qr-label">QR Platba</div>
      <div class="qr-text">Naskenujte QR kód</div>
      <div class="qr-text">pro rychlou platbu</div>
      ${invoice.sender_iban ? `<div class="qr-text muted">${esc(invoice.sender_iban)}</div>` : ''}
    </div>
  </div>` : ''}

  ${invoice.notes ? `
  <div class="notes-box">
    <div class="notes-label">Poznámky</div>
    <div class="notes-text">${esc(invoice.notes)}</div>
  </div>` : ''}

  <div class="footer">
    <span>Faktura č. ${esc(invoice.invoice_number)}</span>
    <span>Vystaveno přes Fakturo · ${esc(formatDate(invoice.issue_date))}</span>
  </div>

</body>
</html>`
}
