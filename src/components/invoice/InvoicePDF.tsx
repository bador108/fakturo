import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Invoice, InvoiceItem } from '@/types'
import { formatDate, formatCurrency, calcTotals } from '@/lib/utils'

// POZNÁMKA: Helvetica (výchozí PDF font) neumí české háčky/čárky (č,ř,š,ž,ě,ď,ť,ň,ů).
// Zkoušeli jsme nahradit vlastním fontem (Noto Sans, DejaVu Sans) s plným pokrytím
// Latin Extended-A, ale @react-pdf/renderer 4.4.1 + fontkit 2.0.4 některé znaky
// (ř,ž,ě,ů,í) i tak vykreslí poškozené (mojibake) — je to bug v knihovně/subsettingu,
// ne ve fontu. Dokud se nenajde skutečná oprava, zůstáváme radši u Helvetiky
// (chybějící znak je lepší než viditelně rozbitý).
Font.registerHyphenationCallback(w => [w])

const c = {
  primary: '#4F46E5',   // brand
  text: '#18181B',      // zinc-900
  muted: '#71717A',     // zinc-500
  border: '#E4E4E7',    // zinc-200
  bg: '#FAFAFA',        // zinc-50
  white: '#FFFFFF',
  amber: '#B45309',
}

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: c.text,
    paddingHorizontal: 48,
    paddingVertical: 48,
    backgroundColor: c.white,
  },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  brandBlock: { flexDirection: 'column', gap: 2, maxWidth: 260 },
  senderName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: c.text, letterSpacing: -0.2 },
  invoiceLabel: { fontSize: 10, color: c.primary, fontFamily: 'Helvetica-Bold', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  invoiceNumber: { fontSize: 12, color: c.muted, marginTop: 1 },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: 6, flexWrap: 'wrap', justifyContent: 'flex-end' },
  metaItem: { flexDirection: 'column', gap: 2 },
  metaLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  // Parties
  partiesRow: { flexDirection: 'row', gap: 24, marginBottom: 28 },
  partyBox: { flex: 1, backgroundColor: c.bg, borderRadius: 6, padding: 14 },
  partyTitle: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  partyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  partyLine: { fontSize: 9, color: c.muted, lineHeight: 1.5 },
  // Table
  table: { marginBottom: 16 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: c.primary,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  tableHeaderCell: { fontSize: 8, color: c.white, fontFamily: 'Helvetica-Bold' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  tableRowAlt: { backgroundColor: '#F4F4F5' },
  tableCell: { fontSize: 9 },
  // Column widths
  colDesc:  { flex: 4 },
  colQty:   { width: 45, textAlign: 'right' },
  colUnit:  { width: 35, textAlign: 'center' },
  colPrice: { width: 65, textAlign: 'right' },
  colVat:   { width: 35, textAlign: 'right' },
  colTotal: { width: 65, textAlign: 'right' },
  // Totals
  totalsBlock: { alignItems: 'flex-end', marginBottom: 24 },
  totalRow: { flexDirection: 'row', gap: 16, marginBottom: 3 },
  totalLabel: { width: 120, fontSize: 9, color: c.muted, textAlign: 'right' },
  totalValue: { width: 80, fontSize: 9, textAlign: 'right' },
  grandTotalRow: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: c.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  grandTotalLabel: { width: 120, fontSize: 10, fontFamily: 'Helvetica-Bold', color: c.white, textAlign: 'right' },
  grandTotalValue: { width: 80, fontSize: 10, fontFamily: 'Helvetica-Bold', color: c.white, textAlign: 'right' },
  // Legal notices (neplátce DPH / reverse charge)
  legalNotice: { fontSize: 8, color: c.amber, marginBottom: 24, marginTop: -14 },
  // Notes
  notesBox: { backgroundColor: c.bg, borderRadius: 6, padding: 12, marginBottom: 24 },
  notesLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  notesText: { fontSize: 9, color: c.text, lineHeight: 1.6 },
  // QR
  qrBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  qrImage: { width: 72, height: 72 },
  qrLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  qrText: { fontSize: 8, color: c.text },
  // Footer
  footer: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: c.muted },
})

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

interface Props {
  invoice: Invoice
  items: InvoiceItem[]
  qrCode?: string
}

export function InvoicePDF({ invoice, items, qrCode }: Props) {
  const currency = invoice.currency
  const { vatBreakdown } = calcTotals(
    items.map(i => ({ description: i.description, quantity: i.quantity, unit: i.unit, unit_price: i.unit_price, vat_rate: i.vat_rate })),
    invoice.vat_payer,
    invoice.reverse_charge
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.senderName}>{invoice.sender_name}</Text>
            <Text style={styles.invoiceLabel}>{invoiceTypeLabel[invoice.invoice_type] ?? 'Faktura'}</Text>
            <Text style={styles.invoiceNumber}>č. {invoice.invoice_number}</Text>
          </View>
          <View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Vystaveno</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.issue_date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DUZP</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.duzp || invoice.issue_date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Splatnost</Text>
                <Text style={[styles.metaValue, { color: c.primary }]}>{formatDate(invoice.due_date)}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              {invoice.variable_symbol && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Variabilní symbol</Text>
                  <Text style={styles.metaValue}>{invoice.variable_symbol}</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Způsob úhrady</Text>
                <Text style={styles.metaValue}>{paymentMethodLabel[invoice.payment_method ?? 'bank_transfer']}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesRow}>
          {/* Sender */}
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Dodavatel</Text>
            <Text style={styles.partyName}>{invoice.sender_name}</Text>
            {invoice.sender_address && <Text style={styles.partyLine}>{invoice.sender_address}</Text>}
            {(invoice.sender_zip || invoice.sender_city) && (
              <Text style={styles.partyLine}>{[invoice.sender_zip, invoice.sender_city].filter(Boolean).join(' ')}</Text>
            )}
            {invoice.sender_ico && <Text style={styles.partyLine}>IČO: {invoice.sender_ico}</Text>}
            {invoice.sender_dic && <Text style={styles.partyLine}>DIČ: {invoice.sender_dic}</Text>}
            {invoice.sender_bank && <Text style={styles.partyLine}>Účet: {invoice.sender_bank}</Text>}
            {invoice.sender_email && <Text style={styles.partyLine}>{invoice.sender_email}</Text>}
            {invoice.sender_phone && <Text style={styles.partyLine}>{invoice.sender_phone}</Text>}
          </View>

          {/* Client */}
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Odběratel</Text>
            <Text style={styles.partyName}>{invoice.client_name}</Text>
            {invoice.client_address && <Text style={styles.partyLine}>{invoice.client_address}</Text>}
            {(invoice.client_zip || invoice.client_city) && (
              <Text style={styles.partyLine}>{[invoice.client_zip, invoice.client_city].filter(Boolean).join(' ')}</Text>
            )}
            {invoice.client_ico && <Text style={styles.partyLine}>IČO: {invoice.client_ico}</Text>}
            {invoice.client_dic && <Text style={styles.partyLine}>DIČ: {invoice.client_dic}</Text>}
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Popis</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Množ.</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Jedn.</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Cena/jedn.</Text>
            {invoice.vat_payer && <Text style={[styles.tableHeaderCell, styles.colVat]}>DPH</Text>}
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Celkem</Text>
          </View>
          {items.map((item, i) => (
            <View key={item.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.unit_price, currency)}</Text>
              {invoice.vat_payer && <Text style={[styles.tableCell, styles.colVat]}>{item.vat_rate} %</Text>}
              <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.total ?? item.quantity * item.unit_price, currency)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Základ DPH</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal, currency)}</Text>
          </View>
          {invoice.vat_payer && !invoice.reverse_charge && vatBreakdown.map(b => (
            <View key={b.rate} style={styles.totalRow}>
              <Text style={styles.totalLabel}>DPH ({b.rate} %)</Text>
              <Text style={styles.totalValue}>{formatCurrency(b.vat, currency)}</Text>
            </View>
          ))}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>K ÚHRADĚ</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total, currency)}</Text>
          </View>
        </View>

        {/* Zákonné poznámky k DPH */}
        {!invoice.vat_payer && (
          <Text style={styles.legalNotice}>Dodavatel není plátcem DPH.</Text>
        )}
        {invoice.vat_payer && invoice.reverse_charge && (
          <Text style={styles.legalNotice}>Daň odvede zákazník (přenesená daňová povinnost, § 92a zákona o DPH).</Text>
        )}

        {/* QR platba */}
        {qrCode && (
          <View style={styles.qrBlock}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qrCode} style={styles.qrImage} />
            <View>
              <Text style={styles.qrLabel}>QR Platba</Text>
              <Text style={styles.qrText}>Naskenujte QR kód</Text>
              <Text style={styles.qrText}>pro rychlou platbu</Text>
              {invoice.sender_iban && <Text style={[styles.qrText, { marginTop: 4, color: c.muted }]}>{invoice.sender_iban}</Text>}
            </View>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Poznámky</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Faktura č. {invoice.invoice_number}</Text>
          <Text style={styles.footerText}>Vystaveno přes Fakturo · {formatDate(invoice.issue_date)}</Text>
        </View>

      </Page>
    </Document>
  )
}
