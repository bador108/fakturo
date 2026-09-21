import { guessCategory } from './expenseCategory'

export interface ParsedReceipt {
  vendor: string | null
  date: string | null
  amount: number | null
  currency: 'CZK' | 'EUR' | 'USD'
  category: string
}

// Částka s desetinnou částí (299,00 / 1 299.50) — celá čísla (IČO, telefon, číslo účtenky) tím vypadnou.
const DECIMAL_AMOUNT = /(\d{1,3}(?:[  .]\d{3})+|\d+)\s?[,.]\s?(\d{2})(?!\d)/g

const TOTAL_STRONG = /(celkem|k\s*úhradě|k\s*uhrade|k\s*platbě|k\s*platbe|total|suma\s*k)/i
const TOTAL_WEAK = /(součet|soucet|suma|zaplaceno|hotově|hotove|platba|karta)/i
const NOT_A_TOTAL = /(dph|daň|dan\b|základ|zaklad|vráceno|vraceno|vrácení|sleva|dýško|dysko)/i
const LINE_TO_SKIP_AS_VENDOR = /(\bfaktura\b|\binvoice\b|\breceipt\b|účtenk|uctenk|paragon|doklad|provozovn|pokladn|pobočk|pobock|datum|číslo|cislo|forma|úhrad|uhrad|hotovost|platb|mezisou|celkem|dph|sazba|děkuj|dekuj|ičo|dič|\bdic\b|\btel\b|www\.|http|@)/i
const COMPANY_SUFFIX = /(s\.\s?r\.\s?o|a\.\s?s\.|spol\.|v\.\s?o\.\s?s|k\.\s?s\.)/i
// Na účtenkách bývá v závorce i "(2,00 EUR)" — kdo vidí Kč/Kc/CZK, ten je v korunách.
const CZK_MARK = /(?:^|[^A-Za-zÀ-ɏ])(?:kč|kc|czk)(?![A-Za-zÀ-ɏ])/i

function toNumber(intPart: string, decimals: string): number | null {
  const int = intPart.replace(/[  .]/g, '')
  const value = parseFloat(`${int}.${decimals}`)
  return Number.isFinite(value) ? value : null
}

function amountsIn(line: string): number[] {
  const out: number[] = []
  for (const m of Array.from(line.matchAll(DECIMAL_AMOUNT))) {
    const v = toNumber(m[1], m[2])
    if (v !== null && v > 0) out.push(v)
  }
  return out
}

function findAmount(lines: string[]): number | null {
  for (const keyword of [TOTAL_STRONG, TOTAL_WEAK]) {
    const candidates: number[] = []
    for (const line of lines) {
      if (!keyword.test(line) || NOT_A_TOTAL.test(line)) continue
      candidates.push(...amountsIn(line))
    }
    if (candidates.length) return Math.max(...candidates)
  }
  // Bez klíčového slova: největší částka s desetinami v celém textu.
  const all = lines.flatMap(amountsIn)
  return all.length ? Math.max(...all) : null
}

function findDate(text: string): string | null {
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  for (const m of Array.from(text.matchAll(/\b(\d{1,2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4}|\d{2})\b/g))) {
    const day = Number(m[1])
    const month = Number(m[2])
    if (day < 1 || day > 31 || month < 1 || month > 12) continue
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])
    if (year < 2000 || year > new Date().getFullYear() + 1) continue
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  return null
}

function tidyVendor(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9À-ɏ\s.&'-]/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 40)
  const letters = cleaned.replace(/[^A-Za-zÀ-ɏ]/g, '')
  if (letters && letters === letters.toUpperCase()) {
    return cleaned.toLowerCase().replace(/(^|\s)([A-Za-zÀ-ɏ])/g, (_, sp: string, ch: string) => sp + ch.toUpperCase())
  }
  return cleaned
}

function findVendor(lines: string[]): string | null {
  const candidates: string[] = []
  for (const line of lines.slice(0, 10)) {
    if (LINE_TO_SKIP_AS_VENDOR.test(line) || line.includes(':')) continue
    if ((line.match(/[A-Za-zÀ-ɏ]/g) ?? []).length < 3) continue
    if ((line.match(/\d/g) ?? []).length / line.length > 0.25) continue
    // Malé písmeno těsně před velkým uvnitř slova ("adyrHotovast") je skoro vždy šum z OCR.
    if (/[a-zà-ÿ][A-ZÀ-ÞČŠŽŘĎŤŇĚŮ]/.test(line)) continue
    // Název obchodu začíná velkým písmenem (nebo číslicí) a neobsahuje cenu ani DPH — řádek
    // "iks 21% Voda 23,00 Kč" je položka a "zašové porrao" šum z ručně dokreslené šipky.
    const trimmed = line.replace(/^[^A-Za-zÀ-ɏ0-9]+/, '')
    if (!/^[A-ZÀ-ÞČŠŽŘĎŤŇĚŮ0-9]/.test(trimmed)) continue
    if (/\d[ ,.]\d{2}(?!\d)|%/.test(trimmed) || CZK_MARK.test(trimmed)) continue
    const vendor = tidyVendor(line)
    if (vendor.length >= 3) candidates.push(vendor)
  }
  // Řádek s "s.r.o." / "a.s." je skoro jistě firma, jinak bereme první rozumný řádek shora.
  return candidates.find(v => COMPANY_SUFFIX.test(v)) ?? candidates[0] ?? null
}

export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const lower = text.toLowerCase()
  const currency = CZK_MARK.test(text) ? 'CZK' : /€|\beur\b/.test(lower) ? 'EUR' : /\$|\busd\b/.test(lower) ? 'USD' : 'CZK'

  return {
    vendor: findVendor(lines),
    date: findDate(text),
    amount: findAmount(lines),
    currency,
    category: guessCategory(text),
  }
}
