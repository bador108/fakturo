import type { BankTransaction } from '@/lib/bankParser'

export interface InvoiceForMatching {
  id: string
  total: number | string
  currency: string
  invoice_number: string
  client_name: string
}

export interface BankMatch {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  amount: number
  currency: string
  txDate: string
}

// Sdílené párování transakce -> faktura (částka + měna, do 2 haléřů kvůli zaokrouhlení).
// Používá ruční CSV/ABO import výpisu (api/bank/upload).
export function matchTransactionsToInvoices(
  invoices: InvoiceForMatching[],
  transactions: BankTransaction[]
): BankMatch[] {
  const matches: BankMatch[] = []
  const usedTxKeys = new Set<string>()

  for (const invoice of invoices) {
    const invoiceTotal = parseFloat(String(invoice.total))
    const match = transactions.find(tx => {
      const key = `${tx.amount}-${tx.date}`
      if (usedTxKeys.has(key)) return false
      return tx.currency === invoice.currency && Math.abs(tx.amount - invoiceTotal) < 0.02
    })
    if (match) {
      usedTxKeys.add(`${match.amount}-${match.date}`)
      matches.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        amount: match.amount,
        currency: match.currency,
        txDate: match.date,
      })
    }
  }

  return matches
}
