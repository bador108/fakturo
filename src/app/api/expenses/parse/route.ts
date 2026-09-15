import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { Currency } from '@/types';

const MONTHS_CZ: Record<string, number> = {
  leden: 1, ledna: 1, únor: 2, února: 2, unor: 2, unora: 2,
  březen: 3, března: 3, brezen: 3, brezna: 3, duben: 4, dubna: 4,
  květen: 5, května: 5, kveten: 5, kvetna: 5, červen: 6, června: 6, cerven: 6, cervna: 6,
  červenec: 7, července: 7, cervenec: 7, cervence: 7, srpen: 8, srpna: 8,
  září: 9, zari: 9, říjen: 10, října: 10, rijen: 10, rijna: 10,
  listopad: 11, listopadu: 11, prosinec: 12, prosince: 12,
};

const CATEGORY_KEYWORDS: { category: string; keywords: RegExp }[] = [
  { category: 'software', keywords: /\b(adobe|figma|notion|github|vercel|openai|anthropic|claude|chatgpt|licence|předplatné|predplatne|subscription|saas|hosting|domain|doména)\b/i },
  { category: 'kancelar', keywords: /\b(papír|papir|tiskárna|tiskarna|kancelářské|kancelarske|toner|šanon|sanon)\b/i },
  { category: 'cestovne', keywords: /\b(letenka|jízdenka|jizdenka|vlak|autobus|benzín|benzin|nafta|taxi|uber|bolt|parkování|parkovani|dálniční|dalnicni)\b/i },
  { category: 'hardware', keywords: /\b(notebook|laptop|monitor|klávesnice|klavesnice|myš|mys|počítač|pocitac|telefon|mobil|tiskárna|tiskarna)\b/i },
  { category: 'marketing', keywords: /\b(reklama|marketing|ads|facebook|instagram|google ads|inzerce|billboard)\b/i },
];

function parseAmount(text: string): number | null {
  const match = text.match(/(\d{1,3}(?:[ .]\d{3})*(?:[,.]\d{1,2})?)\s*(kč|czk|eur|€|\$|usd)?/i);
  if (!match) return null;
  const raw = match[1].replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '');
  const normalized = raw.replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? num : null;
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

function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.test(lower)) return category;
  }
  return 'ostatni';
}

function guessVendor(text: string, amount: number | null): string {
  let cleaned = text;
  if (amount !== null) {
    cleaned = cleaned.replace(/(\d{1,3}(?:[ .]\d{3})*(?:[,.]\d{1,2})?)\s*(kč|czk|eur|€|\$|usd)?/i, ' ');
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
    const amount = parseAmount(trimmed);
    const currency = parseCurrency(trimmed);
    const date = parseDate(trimmed) ?? new Date().toISOString().slice(0, 10);
    const category = guessCategory(trimmed);
    const vendor = guessVendor(trimmed, amount);

    return NextResponse.json({ amount, currency, date, category, vendor, description: trimmed });
  } catch {
    return NextResponse.json({ error: 'Nepodařilo se zpracovat text' }, { status: 400 });
  }
}
