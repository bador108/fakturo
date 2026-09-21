import { guessCategory } from './expenseCategory'

export interface ParsedReceipt {
  vendor: string | null
  date: string | null
  amount: number | null
  currency: 'CZK' | 'EUR' | 'USD'
  category: string
}

// Částka s desetinnou částí (299,00 / 1 299.50) — celá čísla (IČO, telefon, číslo účtenky) tím vypadnou.
const DECIMAL_AMOUNT = /(\d{1,3}(?:[ \u00A0\u202F.]\d{3})+|\d+)\s?[,.]\s?(\d{2})(?!\d)/g

const TOTAL_STRONG = /(celkem|k\s*úhradě|k\s*uhrade|k\s*platbě|k\s*platbe|k\s*zaplacení|k\s*zaplaceni|total|amount\s*due|balance\s*due|suma\s*k)/i
const TOTAL_WEAK = /(součet|soucet|suma|zaplaceno|hotově|hotove|platba|karta)/i
const NOT_A_TOTAL = /(dph|daň|dan\b|základ|zaklad|vráceno|vraceno|vrácení|sleva|dýško|dysko)/i
// "Celkem s DPH" je naopak přesně ta částka, kterou hledáme (bez DPH ji vylučuje NOT_A_TOTAL).
const INCLUDES_VAT = /(s\s*dph|vč\.?\s*dph|včetně\s*dph|vcetne\s*dph|incl\.?\s*(vat|tax)|including\s*(vat|tax)|with\s*vat)/i
const LINE_TO_SKIP_AS_VENDOR = /(\bfaktura\b|\binvoice\b|\breceipt\b|účtenk|uctenk|paragon|doklad|provozovn|pokladn|pobočk|pobock|datum|číslo|cislo|forma|úhrad|uhrad|hotovost|platb|mezisou|celkem|dph|sazba|děkuj|dekuj|ičo|dič|\bdic\b|\btel\b|www\.|http|@|vystaveno|splatnost|duzp|dodavatel|odběratel|odberatel|zákazník|zakaznik|bankovní|bankovni|variabilní|variabilni|konstantní|specifick|způsob|zpusob|popis|množ|mnoz|\bjedn|\bcena\b|\bdate\b|\bamount\b|\bdue\b|\bpage\b|\bstrana\b|objedn|potvrzen|\border\b|confirmation|thank\s*you|nákup|nakup|předmět|predmet|\bsubject\b)/i
const COMPANY_SUFFIX = /(s\.\s?r\.\s?o|a\.\s?s\.|spol\.|v\.\s?o\.\s?s|k\.\s?s\.|\b(inc|ltd|llc|gmbh|corp|limited|plc|sarl|ag)\b\.?|\bb\.?v\.)/i
// Na účtenkách bývá v závorce i "(2,00 EUR)" — kdo vidí Kč/Kc/CZK, ten je v korunách.
const CZK_MARK = /(?:^|[^A-Za-zÀ-ɏ])(?:kč|kc|czk)(?![A-Za-zÀ-ɏ])/i

// Popisky na fakturách (dodavatel/odběratel), podle kterých se pozná, čí jméno stojí pod nimi.
const SUPPLIER_INLINE = /^(dodavatel|dodavatelé|prodávající|prodavajici|vystavitel|supplier|vendor|seller|sold\s*by|issued\s*by)\s*:\s*(.+)$/i
const SUPPLIER_LABEL = /^(dodavatel|dodavatelé|prodávající|prodavajici|vystavitel|supplier|vendor|seller|sold\s*by|issued\s*by)\s*:?$/i
const PARTY_LABEL = /^(odběratel|odberatel|zákazník|zakaznik|příjemce|prijemce|kupující|kupujici|customer|client|bill(ed)?\s*to|ship(ped)?\s*to|sold\s*to)\s*:?$/i
const PARTY_FIELD = /^(ičo|ič|dič|ic\s*dph|dic|vat|tax\s*id|tel|phone|e-?mail|www|web|adresa|address|banka|účet|ucet|iban|swift)\b/i

// Datum vystavení má přednost před splatností — na fakturách stojí obojí vedle sebe.
const ISSUE_LABEL = /(datum\s*vystaven|vystaveno|vystavení|vystaveni|date\s*of\s*issue|issue\s*date|date\s*issued|invoice\s*date|datum\s*faktury|billing\s*date|datum\s*uskute|duzp|purchase\s*date|order\s*date|datum\s*objedn|datum\s*platby|paid\s*on)/i
const DUE_LABEL = /(splatnost|splatn|due\s*date|\bdue\b|platnost|expir|valid\s*until)/i

const MONTHS: Record<string, number> = {
  leden: 1, ledna: 1, january: 1, jan: 1,
  unor: 2, unora: 2, february: 2, feb: 2,
  brezen: 3, brezna: 3, march: 3, mar: 3,
  duben: 4, dubna: 4, april: 4, apr: 4,
  kveten: 5, kvetna: 5, may: 5,
  cerven: 6, cervna: 6, june: 6, jun: 6,
  cervenec: 7, cervence: 7, july: 7, jul: 7,
  srpen: 8, srpna: 8, august: 8, aug: 8,
  zari: 9, september: 9, sept: 9, sep: 9,
  rijen: 10, rijna: 10, october: 10, oct: 10,
  listopad: 11, listopadu: 11, november: 11, nov: 11,
  prosinec: 12, prosince: 12, december: 12, dec: 12,
}
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|')
const DAY_MONTH_YEAR = new RegExp(`\\b(\\d{1,2})\\.?\\s*(${MONTH_RE})\\.?,?\\s*(\\d{4})\\b`, 'gi')
const MONTH_DAY_YEAR = new RegExp(`\\b(${MONTH_RE})\\.?\\s*(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})\\b`, 'gi')

function toNumber(intPart: string, decimals: string): number | null {
  const int = intPart.replace(/[ \u00A0\u202F.]/g, '')
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

// V PDF stojí popisek ("K ÚHRADĚ") a částka často na dvou po sobě jdoucích řádcích.
function amountsNear(lines: string[], i: number): number[] {
  const own = amountsIn(lines[i])
  if (own.length) return own
  const next = lines[i + 1]
  if (!next || lines[i].length > 32 || TOTAL_STRONG.test(next) || NOT_A_TOTAL.test(next)) return []
  return amountsIn(next)
}

function findAmount(lines: string[]): number | null {
  for (const keyword of [TOTAL_STRONG, TOTAL_WEAK]) {
    const candidates: number[] = []
    lines.forEach((line, i) => {
      if (!keyword.test(line)) return
      if (NOT_A_TOTAL.test(line) && !INCLUDES_VAT.test(line)) return
      candidates.push(...amountsNear(lines, i))
    })
    if (candidates.length) return Math.max(...candidates)
  }
  // Bez klíčového slova: největší částka s desetinami v celém textu.
  const all = lines.flatMap(amountsIn)
  return all.length ? Math.max(...all) : null
}

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function validDate(year: number, month: number, day: number): string | null {
  if (day < 1 || day > 31 || month < 1 || month > 12) return null
  if (year < 2000 || year > new Date().getFullYear() + 1) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Všechna data v textu v pořadí, jak za sebou stojí: 2026-09-17, 17. 9. 2026, 17. září 2026, Sep 17, 2026.
function datesIn(text: string): string[] {
  const t = stripDiacritics(text)
  const found: { idx: number; iso: string }[] = []
  const add = (idx: number, iso: string | null) => { if (iso) found.push({ idx, iso }) }

  for (const m of Array.from(t.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g))) add(m.index ?? 0, validDate(+m[1], +m[2], +m[3]))
  for (const m of Array.from(t.matchAll(/\b(\d{1,2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4}|\d{2})\b/g))) {
    add(m.index ?? 0, validDate(m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]), +m[2], +m[1]))
  }
  for (const m of Array.from(t.matchAll(DAY_MONTH_YEAR))) add(m.index ?? 0, validDate(+m[3], MONTHS[m[2].toLowerCase()], +m[1]))
  for (const m of Array.from(t.matchAll(MONTH_DAY_YEAR))) add(m.index ?? 0, validDate(+m[3], MONTHS[m[1].toLowerCase()], +m[2]))

  return found.sort((a, b) => a.idx - b.idx).map(f => f.iso)
}

function findDate(lines: string[]): string | null {
  for (let i = 0; i < lines.length; i++) {
    const label = ISSUE_LABEL.exec(lines[i])
    if (!label) continue
    const own = datesIn(lines[i].slice(label.index))[0]
    if (own) return own
    // Popisek a datum na dvou řádcích: "VYSTAVENO" / "17. 9. 2026"
    if (lines[i].length <= 32 && lines[i + 1]) {
      const next = datesIn(lines[i + 1])[0]
      if (next) return next
    }
  }
  const notDue = lines.filter(l => !DUE_LABEL.test(l)).flatMap(datesIn)
  return notDue[0] ?? lines.flatMap(datesIn)[0] ?? null
}

function tidyVendor(raw: string, max = 40): string {
  const cleaned = raw.replace(/[^A-Za-z0-9À-ɏ\s.&'-]/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, max)
  const letters = cleaned.replace(/[^A-Za-zÀ-ɏ]/g, '')
  if (letters && letters === letters.toUpperCase()) {
    return cleaned.toLowerCase().replace(/(^|\s)([A-Za-zÀ-ɏ])/g, (_, sp: string, ch: string) => sp + ch.toUpperCase())
  }
  return cleaned
}

// Faktura má dodavatele pod popiskem "Dodavatel" (nebo "Dodavatel: Firma"). Nahoře na straně je u faktur
// s logem místo textu jen "FAKTURA" a "VYSTAVENO", proto se první řádek shora nedá brát jako firma.
function findSupplier(lines: string[]): string | null {
  for (let i = 0; i < lines.length; i++) {
    const inline = lines[i].match(SUPPLIER_INLINE)
    let candidate: string | undefined = inline ? inline[2] : undefined
    if (!candidate && SUPPLIER_LABEL.test(lines[i])) {
      const next = lines[i + 1]
      if (next && !PARTY_LABEL.test(next) && !SUPPLIER_LABEL.test(next)) candidate = next
    }
    if (!candidate || PARTY_FIELD.test(candidate)) continue
    if ((candidate.match(/[A-Za-zÀ-ɏ]/g) ?? []).length < 3) continue
    const vendor = tidyVendor(candidate, 60)
    if (vendor.length >= 3) return vendor
  }
  return null
}

function findVendor(lines: string[]): string | null {
  const supplier = findSupplier(lines)
  if (supplier) return supplier

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
    date: findDate(lines),
    amount: findAmount(lines),
    currency,
    category: guessCategory(text),
  }
}
