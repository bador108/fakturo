import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Invoice, InvoiceItemDraft, VatRate } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generuje výchozí číslo faktury (např. 20260001) nebo inkrementuje poslední číslo
 */
export function generateInvoiceNumber(lastNumber?: string): string {
  const currentYear = new Date().getFullYear();
  if (!lastNumber) {
    return `${currentYear}0001`;
  }
  const match = lastNumber.match(/(\d+)$/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return lastNumber.replace(/\d+$/, String(nextNum).padStart(match[1].length, '0'));
  }
  return `${currentYear}0001`;
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

/**
 * Agreguje data faktur podle měsíců pro grafy na dashboardu (CashflowChart a další)
 */
export function buildMonthData(invoices: Invoice[] = []) {
  const monthsMap = new Map<
    string,
    {
      month: string;
      name: string;
      label: string;
      total: number;
      amount: number;
      invoiced: number;
      paid: number;
      revenue: number;
      count: number;
    }
  >();

  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('cs-CZ', { month: 'short' });
    monthsMap.set(key, {
      month: monthName,
      name: monthName,
      label: monthName,
      total: 0,
      amount: 0,
      invoiced: 0,
      paid: 0,
      revenue: 0,
      count: 0,
    });
  }

  (invoices || []).forEach((inv) => {
    const dateStr = inv.issue_date || inv.created_at;
    if (!dateStr) return;
    const key = dateStr.slice(0, 7);
    if (monthsMap.has(key)) {
      const curr = monthsMap.get(key)!;
      const amt = Number(inv.total) || 0;
      curr.total += amt;
      curr.amount += amt;
      curr.invoiced += amt;
      curr.count += 1;

      if (inv.status === 'paid') {
        curr.paid += amt;
        curr.revenue += amt;
      }
    }
  });

  return Array.from(monthsMap.values());
}

export interface VatBreakdownItem {
  rate: VatRate;
  base: number;
  vat: number;
  total: number;
}

/**
 * Spočítá součty a rozpad DPH per-položka
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
    .filter((entry) => entry[1].base > 0)
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
