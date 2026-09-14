import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InvoiceItemDraft, VatRate } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formátuje číslo na měnu (výchozí CZK v českém formátu "1 000,00 Kč")
 */
export function formatCurrency(amount: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency || 'CZK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

/**
 * Formátuje datum do českého tvaru (např. "14. 9. 2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('cs-CZ').format(date);
}

export interface VatBreakdownItem {
  rate: VatRate;
  base: number;
  vat: number;
  total: number;
}

/**
 * Spočíta součty a rozpad DPH per-položka
 */
export function calcTotals(
  items: InvoiceItemDraft[],
  vatPayer: boolean,
  reverseCharge: boolean
) {
  let subtotal = 0;
  let totalVat = 0;
  const breakdownMap: Record<number, { base: number; vat: number; total: number }> = {
    0: { base: 0, vat: 0, total: 0 },
    12: { base: 0, vat: 0, total: 0 },
    21: { base: 0, vat: 0, total: 0 },
  };

  items.forEach((item) => {
    const itemSubtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    subtotal += itemSubtotal;

    const itemVatRate = vatPayer && !reverseCharge ? item.vat_rate : 0;
    const itemVat = (itemSubtotal * itemVatRate) / 100;
    const itemTotal = itemSubtotal + itemVat;

    totalVat += itemVat;

    if (!breakdownMap[itemVatRate]) {
      breakdownMap[itemVatRate] = { base: 0, vat: 0, total: 0 };
    }
    breakdownMap[itemVatRate].base += itemSubtotal;
    breakdownMap[itemVatRate].vat += itemVat;
    breakdownMap[itemVatRate].total += itemTotal;
  });

  const vatBreakdown: VatBreakdownItem[] = Object.entries(breakdownMap)
    .filter(([_, data]) => data.base > 0)
    .map(([rate, data]) => ({
      rate: Number(rate) as VatRate,
      base: data.base,
      vat: data.vat,
      total: data.total,
    }));

  return {
    subtotal,
    vatAmount: totalVat,
    total: subtotal + totalVat,
    vatBreakdown,
  };
}
