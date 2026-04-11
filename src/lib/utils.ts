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

export function calcTotals(
  items: { quantity: number; unit_price: number }[],
  vatRate: number
) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const vat_amount = subtotal * (vatRate / 100)
  const total = subtotal + vat_amount
  return { subtotal, vat_amount, total }
}
