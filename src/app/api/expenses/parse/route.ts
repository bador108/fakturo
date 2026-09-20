import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { Currency } from '@/types';
import { guessCategory } from '@/lib/expenseCategory';

const MONTHS_CZ: Record<string, number> = {
  leden: 1, ledna: 1, únor: 2, února: 2, unor: 2, unora: 2,
  březen: 3, března: 3, brezen: 3, brezna: 3, duben: 4, dubna: 4,
  květen: 5, května: 5, kveten: 5, kvetna: 5, červen: 6, června: 6, cerven: 6, cervna: 6,
  červenec: 7, července: 7, cervenec: 7, cervence: 7, srpen: 8, srpna: 8,
  září: 9, zari: 9, říjen: 10, října: 10, rijen: 10, rijna: 10,
  listopad: 11, listopadu: 11, prosinec: 12, prosince: 12,
};

// Číslo buď oddělené mezerami/tečkami po tisících (1 234 567), nebo souvislý řetězec číslic
// (25000) — ta druhá varianta musí jít až jako fallback, jinak si "25000" ukousne jen "250".
const NUM_SOURCE = String.raw`\d{1,3}(?:[ .]\d{3})+(?:[,.]\d{1,2})?|\d+(?:[,.]\d{1,2})?`;

function toNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '');
  const normalized = cleaned.replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? num : null;
}

// Vrací i přesně matchnutý úsek (raw, včetně měny), ať ho guessVendor umí z textu vyříznout.
function parseAmount(text: string): { value: number; raw: string } | null {
  // Nejdřív zkusit číslo hned u měny — jinak si to plete třeba "iPhone 15" s cenou "15 000 Kč".
  const currencyAnchored = text.match(new RegExp(`(${NUM_SOURCE})\\s*(kč|czk|eur|€|\\$|usd)`, 'i'));
  if (currencyAnchored) {
    const value = toNumber(currencyAnchored[1]);
    if (value !== null) return { value, raw: currencyAnchored[0] };
  }
  // Fallback: bez měny vzít největší číslo v textu (nejpravděpodobnější kandidát na cenu).
  let best: { value: number; raw: string } | null = null;
  for (const m of Array.from(text.matchAll(new RegExp(NUM_SOURCE, 'g')))) {
    const value = toNumber(m[0]);
    if (value !== null && (!best || value > best.value)) best = { value, raw: m[0] };
  }
  return best;
}

function parseCurrency(text: string): Currency {
  const lower = text.toLowerCase();
  if (/\beur\b|€/.test(lower)) return 'EUR';
  if (/\busd\b|\$/.test(lower)) return 'USD';
  return 'CZK';
}

function parseDate(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\bdnes\b/.test(lower)) return new Date().toISOString().slice(0, 10);
  if (/\bvčera\b|\bvcera\b/.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dotted = text.match(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})?\b/);
  if (dotted) {
    const year = dotted[3] ?? String(new Date().getFullYear());
    return `${year}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`;
  }

  const named = text.match(new RegExp(`\\b(\\d{1,2})\\.?\\s+(${Object.keys(MONTHS_CZ).join('|')})\\b`, 'i'));
  if (named) {
    const month = MONTHS_CZ[named[2].toLowerCase()];
    const yearMatch = text.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
    return `${year}-${String(month).padStart(2, '0')}-${named[1].padStart(2, '0')}`;
  }

  return null;
}

function guessVendor(text: string, amountRaw: string | null): string {
  let cleaned = text;
  if (amountRaw) {
    cleaned = cleaned.replace(amountRaw, ' ');
  }
  cleaned = cleaned
    .replace(/\b(dnes|včera|vcera)\b/gi, ' ')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
    .replace(/\b\d{1,2}\.\s*\d{1,2}\.\s*(\d{4})?\b/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 4);
  return words.join(' ') || 'Výdaj';
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Prázdný text' }, { status: 400 });
    }

    const trimmed = text.trim();
    const amountMatch = parseAmount(trimmed);
    const currency = parseCurrency(trimmed);
    const date = parseDate(trimmed) ?? new Date().toISOString().slice(0, 10);
    const category = guessCategory(trimmed);
    const vendor = guessVendor(trimmed, amountMatch?.raw ?? null);

    return NextResponse.json({ amount: amountMatch?.value ?? null, currency, date, category, vendor, description: trimmed });
  } catch {
    return NextResponse.json({ error: 'Nepodařilo se zpracovat text' }, { status: 400 });
  }
}
