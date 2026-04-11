import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Invoice, InvoiceItem } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'

// Register a clean sans-serif font stack via system fonts
Font.registerHyphenationCallback(w => [w])

const c = {
  primary: '#4F46E5',   // indigo-600
  text: '#18181B',      // zinc-900
  muted: '#71717A',     // zinc-500
  border: '#E4E4E7',    // zinc-200
  bg: '#FAFAFA',        // zinc-50
  white: '#FFFFFF',
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
  brandBlock: { flexDirection: 'column', gap: 2 },
  brandName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: c.primary, letterSpacing: 0.5 },
  invoiceLabel: { fontSize: 11, color: c.muted, marginTop: 2 },
  invoiceNumber: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: c.text },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 6 },
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
  colQty:   { width: 50, textAlign: 'right' },
  colUnit:  { width: 40, textAlign: 'center' },
  colPrice: { width: 70, textAlign: 'right' },
  colTotal: { width: 70, textAlign: 'right' },
  // Totals
  totalsBlock: { alignItems: 'flex-end', marginBottom: 24 },
  totalRow: { flexDirection: 'row', gap: 16, marginBottom: 3 },
  totalLabel: { width: 100, fontSize: 9, color: c.muted, textAlign: 'right' },
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
  grandTotalLabel: { width: 100, fontSize: 10, fontFamily: 'Helvetica-Bold', color: c.white, textAlign: 'right' },
  grandTotalValue: { width: 80, fontSize: 10, fontFamily: 'Helvetica-Bold', color: c.white, textAlign: 'right' },
  // Notes
  notesBox: { backgroundColor: c.bg, borderRadius: 6, padding: 12, marginBottom: 24 },
  notesLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  notesText: { fontSize: 9, color: c.text, lineHeight: 1.6 },
  // Footer
  footer: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: c.muted },
})

interface Props {
  invoice: Invoice
  items: InvoiceItem[]
}

export function InvoicePDF({ invoice, items }: Props) {
  const currency = invoice.currency

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>Fakturo</Text>
            <Text style={styles.invoiceLabel}>FAKTURA</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          </View>
          <View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Datum vystavení</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.issue_date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Datum splatnosti</Text>
                <Text style={[styles.metaValue, { color: c.primary }]}>{formatDate(invoice.due_date)}</Text>
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
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Popis</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Množ.</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Jedn.</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Cena/jedn.</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Celkem</Text>
          </View>
          {items.map((item, i) => (
            <View key={item.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.unit_price, currency)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.total, currency)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Základ DPH</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal, currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>DPH ({invoice.vat_rate} %)</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.vat_amount, currency)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>K ÚHRADĚ</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total, currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Poznámky</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Fakturo – faktura č. {invoice.invoice_number}</Text>
          <Text style={styles.footerText}>Vystaveno {formatDate(invoice.issue_date)}</Text>
        </View>

      </Page>
    </Document>
  )
}
