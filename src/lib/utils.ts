import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Currency } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'd. M. yyyy', { locale: cs })
}

export function generateInvoiceNumber(seq: number, year?: number): string {
  const y = year ?? new Date().getFullYear()
  return `${y}${String(seq).padStart(4, '0')}`
}

export interface MonthData {
  label: string
  revenue: number
  invoiced: number
}

export function buildMonthData(invoices: { status: string; total: number; issue_date: string }[]): MonthData[] {
  const now = new Date()
  const months: MonthData[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('cs-CZ', { month: 'short' })
    const monthInvoices = invoices.filter(inv => inv.issue_date?.startsWith(key))
    const revenue = monthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
    const invoiced = monthInvoices.reduce((s, i) => s + Number(i.total), 0)
    months.push({ label, revenue, invoiced })
  }

  return months
}

export function calcTotals(
  items: { quantity: number; unit_price: number }[],
  vatRate: number
) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const vat_amount = subtotal * (vatRate / 100)
  const total = subtotal + vat_amount
  return { subtotal, vat_amount, total }
}
