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

const DEFAULT_ACCENT = '#0c0c0e'

function sanitizeColor(color: string | null | undefined): string {
  if (color && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color)) return color
  return DEFAULT_ACCENT
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
  const accent = sanitizeColor(invoice.accent_color)
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
      <div class="summary-total-row">
        <span>DPH (${b.rate} %)</span>
        <span>${esc(formatCurrency(b.vat, currency))}</span>
      </div>
    `).join('')

  // Rozpad podle sazeb se hodí hlavně u faktur s víc sazbami zaráz — u jedné sazby
  // by jen zdvojoval řádky, co jsou už v totals.
  const recapTable = (invoice.vat_payer && !invoice.reverse_charge && vatBreakdown.length > 1) ? `
  <table class="recap-table">
    <thead>
      <tr><th>Sazba DPH</th><th>Základ</th><th>Výše DPH</th><th>Celkem</th></tr>
    </thead>
    <tbody>
      ${vatBreakdown.map(b => `
      <tr>
        <td>${b.rate} %</td>
        <td>${esc(formatCurrency(b.base, currency))}</td>
        <td>${esc(formatCurrency(b.vat, currency))}</td>
        <td>${esc(formatCurrency(b.total, currency))}</td>
      </tr>`).join('')}
    </tbody>
  </table>` : ''

  // Souhrn jede pod tabulkou položek jako jeden světlý box rozdělený na sloupce —
  // platební údaje / mezisoučty / QR pohromadě, ať je jasné na první pohled kam a kolik poslat.
  const bankAccount = invoice.sender_iban || invoice.sender_bank || null
  const summaryCard = `
  <div class="summary-card">
    <div class="summary-col summary-payment">
      ${bankAccount ? `<div class="summary-item"><span class="summary-label">Bankovní účet</span><span class="summary-value">${esc(bankAccount)}</span></div>` : ''}
      ${invoice.variable_symbol ? `<div class="summary-item"><span class="summary-label">Variabilní symbol</span><span class="summary-value">${esc(invoice.variable_symbol)}</span></div>` : ''}
      <div class="summary-item"><span class="summary-label">Způsob platby</span><span class="summary-value">${esc(paymentMethodLabel[invoice.payment_method ?? 'bank_transfer'])}</span></div>
    </div>
    <div class="summary-col summary-totals">
      <div class="summary-total-row"><span>Základ DPH</span><span>${esc(formatCurrency(invoice.subtotal, currency))}</span></div>
      ${vatRows}
      <div class="summary-grand"><span class="summary-grand-label">K úhradě</span><span class="summary-grand-value">${esc(formatCurrency(invoice.total, currency))}</span></div>
    </div>
    ${qrCode ? `
    <div class="summary-col summary-qr">
      <img src="${qrCode}" alt="QR platba" />
      <span class="summary-qr-caption">QR platba</span>
    </div>` : ''}
  </div>`

  const paymentTerms = `<p class="payment-terms">Splatnost je uvedena výše. Úhrada se považuje za provedenou dnem připsání částky na účet dodavatele.</p>`

  const legalNotice = !invoice.vat_payer
    ? '<p class="legal-notice">Dodavatel není plátcem DPH.</p>'
    : (invoice.reverse_charge
      ? '<p class="legal-notice">Daň odvede zákazník (přenesená daňová povinnost, § 92a zákona o DPH).</p>'
      : '')

  const logoBlock = invoice.sender_logo_url
    ? `<img class="sender-logo" src="${esc(invoice.sender_logo_url)}" alt="${esc(invoice.sender_name)}" />`
    : ''

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
    background: #ffffff;
    padding: 48px;
  }
  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 36px; }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .sender-logo { height: 48px; max-width: 140px; object-fit: contain; }
  .sender-name { font-size: 19pt; font-weight: 700; color: ${accent}; letter-spacing: -0.2px; margin: 0; }
  .invoice-label { font-size: 10.5pt; font-weight: 700; color: ${accent}; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.8px; }
  .invoice-number { font-size: 12pt; color: #71717A; margin-top: 1px; }
  .meta-block { text-align: right; }
  .meta-row { display: flex; gap: 14px; margin-top: 6px; justify-content: flex-end; flex-wrap: wrap; }
  .meta-item { display: flex; flex-direction: column; gap: 2px; }
  .meta-label { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-value { font-size: 9.5pt; font-weight: 700; }
  .meta-value.accent { color: ${accent}; }

  .parties { display: flex; gap: 24px; margin-bottom: 32px; }
  .party-box { flex: 1; background: #FAFAFA; border-radius: 6px; padding: 16px 18px; }
  .party-title { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
  .party-name { font-size: 11.5pt; font-weight: 700; color: ${accent}; margin-bottom: 4px; }
  .party-line { font-size: 9.5pt; color: #71717A; line-height: 1.5; }

  .summary-card { display: flex; align-items: stretch; background: #FAFAFA; border: 1px solid #ECECEF; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
  .summary-col { padding: 18px 22px; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
  .summary-col + .summary-col { border-left: 1px solid #E4E4E7; }
  .summary-payment { flex: 1.1; }
  .summary-totals { flex: 1; gap: 4px; }
  .summary-item { display: flex; flex-direction: column; gap: 2px; }
  .summary-label { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-value { font-size: 10pt; font-weight: 700; color: #18181B; }
  .summary-total-row { display: flex; justify-content: space-between; gap: 16px; font-size: 8.5pt; color: #71717A; }
  .summary-grand { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-top: 6px; padding-top: 8px; border-top: 1px solid #E4E4E7; }
  .summary-grand-label { font-size: 9pt; font-weight: 700; color: #18181B; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-grand-value { font-size: 15pt; font-weight: 700; color: ${accent}; }
  .summary-qr { flex: 0 0 auto; align-items: center; gap: 4px; }
  .summary-qr img { width: 84px; height: 84px; display: block; }
  .summary-qr-caption { font-size: 6.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.4px; text-align: center; }

  .payment-terms { font-size: 8pt; color: #A1A1AA; margin: 0 0 24px; }

  .recap-table { width: 100%; border-collapse: collapse; margin: 4px 0 20px; }
  .recap-table th { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; padding: 4px 0 6px; border-bottom: 1px solid #E4E4E7; }
  .recap-table th:first-child { text-align: left; }
  .recap-table td { font-size: 9pt; padding: 5px 0; text-align: right; border-bottom: 1px solid #F4F4F5; }
  .recap-table td:first-child { text-align: left; font-weight: 600; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
  thead tr { background: ${accent}; }
  thead th { color: #fff; font-size: 8.5pt; font-weight: 700; padding: 7px 10px; text-align: left; }
  tbody td { font-size: 9.5pt; padding: 7px 10px; border-bottom: 1px solid #E4E4E7; }
  tbody tr.alt { background: #F4F4F5; }
  .col-qty, .col-price, .col-vat, .col-total { text-align: right; white-space: nowrap; }
  .col-unit { text-align: center; }

  .legal-notice { font-size: 8.5pt; color: #B45309; margin-bottom: 20px; }

  .notes-box { background: #FAFAFA; border-radius: 6px; padding: 12px; margin-bottom: 24px; }
  .notes-label { font-size: 7.5pt; color: #71717A; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
  .notes-text { font-size: 9.5pt; line-height: 1.6; white-space: pre-wrap; }

  .footer { border-top: 1px solid #E4E4E7; padding-top: 14px; margin-top: 8px; }
  .footer-thanks { font-size: 9.5pt; font-weight: 700; color: #18181B; margin: 0 0 4px; }
  .footer-meta { display: flex; justify-content: space-between; font-size: 8.5pt; color: #71717A; }
</style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      ${logoBlock}
      <div>
        <p class="sender-name">${esc(invoice.sender_name)}</p>
        <div class="invoice-label">${esc(invoiceTypeLabel[invoice.invoice_type] ?? 'Faktura')}</div>
        <div class="invoice-number">č. ${esc(invoice.invoice_number)}</div>
      </div>
    </div>
    <div class="meta-block">
      <div class="meta-row">
        <div class="meta-item"><span class="meta-label">Vystaveno</span><span class="meta-value">${esc(formatDate(invoice.issue_date))}</span></div>
        <div class="meta-item"><span class="meta-label">DUZP</span><span class="meta-value">${esc(formatDate(invoice.duzp || invoice.issue_date))}</span></div>
        <div class="meta-item"><span class="meta-label">Splatnost</span><span class="meta-value accent">${esc(formatDate(invoice.due_date))}</span></div>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <div class="party-title">Dodavatel</div>
      <div class="party-name">${esc(invoice.sender_name)}</div>
      ${partyLines([invoice.sender_address, senderCityLine || null, invoice.sender_ico ? `IČO: ${invoice.sender_ico}` : null, invoice.sender_dic ? `DIČ: ${invoice.sender_dic}` : null, invoice.sender_business_registry, invoice.sender_email, invoice.sender_web, invoice.sender_phone])}
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

  ${summaryCard}

  ${paymentTerms}

  ${recapTable}

  ${legalNotice}

  ${invoice.notes ? `
  <div class="notes-box">
    <div class="notes-label">Poznámky</div>
    <div class="notes-text">${esc(invoice.notes)}</div>
  </div>` : ''}

  <div class="footer">
    <p class="footer-thanks">Děkujeme za spolupráci</p>
    <div class="footer-meta">
      <span>Faktura č. ${esc(invoice.invoice_number)}</span>
      <span>Vystaveno přes Fakturo · ${esc(formatDate(invoice.issue_date))}</span>
    </div>
  </div>

</body>
</html>`
}
