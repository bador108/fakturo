// Český standard QR platby (SPD). Vrací null, když u faktury není IBAN.
export function buildQrPayload(invoice: {
  sender_iban?: string | null
  total: number
  currency: string
  invoice_number: string
  variable_symbol?: string | null
}): string | null {
  if (!invoice.sender_iban) return null
  const iban = invoice.sender_iban.replace(/\s/g, '')
  const amount = Number(invoice.total).toFixed(2)
  return `SPD*1.0*ACC:${iban}*AM:${amount}*CC:${invoice.currency}*X-VS:${invoice.variable_symbol ?? ''}*MSG:Faktura ${invoice.invoice_number}`
}

export const PUBLIC_TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
