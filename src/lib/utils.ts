import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InvoiceItemDraft, VatRate } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface VatBreakdownItem {
  rate: VatRate;
  base: number;
  vat: number;
  total: number;
}

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
