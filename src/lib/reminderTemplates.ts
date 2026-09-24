import type { ReminderTone } from '@/types'

// Texty upomínek: tón (volí uživatel v Nastavení) × stupeň (1.–3. upomínka po splatnosti
// přitvrzuje, ale zůstává slušná). Stupeň 0 = připomínka před splatností.
// Vrací prostý text — escapování řeší volající (e-mail) resp. React (náhled v Nastavení).

export const REMINDER_TONES: { value: ReminderTone; label: string; description: string }[] = [
  { value: 'pratelsky', label: 'Přátelský', description: 'Vlídně, jako mezi známými.' },
  { value: 'vecny', label: 'Věcný', description: 'Krátce a jasně, bez omáčky.' },
  { value: 'formalni', label: 'Formální', description: 'Úřední tón pro firmy a instituce.' },
]

export const DEFAULT_REMINDER_TONE: ReminderTone = 'vecny'

// reminder_days: kladné číslo = dny PŘED splatností, záporné = dny PO splatnosti (tak je ukládá Nastavení)
export const DEFAULT_REMINDER_DAYS = [3, -3, -7, -14]

export const REMINDER_LEVEL_LABELS = ['Před splatností', '1. upomínka — mile', '2. upomínka — jasněji', '3. upomínka — důrazně, ale slušně']

export function isReminderTone(v: unknown): v is ReminderTone {
  return v === 'pratelsky' || v === 'vecny' || v === 'formalni'
}

export function daysLabel(n: number): string {
  return `${n} ${n === 1 ? 'den' : n >= 2 && n <= 4 ? 'dny' : 'dní'}`
}

interface ReminderInput {
  tone: ReminderTone
  /** 0 = před splatností, 1–3 = pořadí upomínky po splatnosti (vyšší se ořízne na 3) */
  level: number
  /** počet dní do splatnosti (level 0) nebo po splatnosti (level 1–3) */
  days: number
  invoiceNumber: string
  senderName: string
}

export function buildReminder({ tone, level, days, invoiceNumber, senderName }: ReminderInput): { subject: string; body: string } {
  const lvl = Math.max(0, Math.min(3, level))
  const d = daysLabel(days)
  const f = `faktura č. ${invoiceNumber} od ${senderName}`
  const hi = tone === 'formalni' ? 'Vážená paní, vážený pane,' : 'Dobrý den,'

  if (lvl === 0) {
    const body = {
      pratelsky: `jen připomínáme, že ${f} bude splatná za ${d}. Děkujeme!`,
      vecny: `připomínáme, že ${f} bude splatná za ${d}.`,
      formalni: `dovolujeme si Vám připomenout, že ${f} bude splatná za ${d}.`,
    }[tone]
    return { subject: `Připomínka: faktura č. ${invoiceNumber} je splatná za ${d}`, body: `${hi}\n${body}` }
  }

  const bodies: Record<ReminderTone, [string, string, string]> = {
    pratelsky: [
      `jen drobné upozornění — ${f} je ${d} po splatnosti. Možná to jen zapadlo v e-mailech. Pokud už je platba na cestě, děkujeme a tuto zprávu prosím ignorujte.`,
      `ozýváme se znovu — ${f} je stále neuhrazená, už ${d} po splatnosti. Budeme moc rádi, když ji uhradíte v nejbližších dnech.`,
      `${f} je už ${d} po splatnosti a platba zatím nedorazila. Prosíme o úhradu do 5 pracovních dnů. Pokud je něco v nepořádku, stačí odpovědět na tento e-mail a domluvíme se.`,
    ],
    vecny: [
      `upozorňujeme, že ${f} je ${d} po splatnosti. Prosíme o její úhradu.`,
      `${f} zůstává neuhrazená, je ${d} po splatnosti. Prosíme o úhradu v nejbližších dnech.`,
      `${f} je ${d} po splatnosti a stále není uhrazená. Žádáme o úhradu nejpozději do 5 pracovních dnů od doručení tohoto e-mailu. Pokud jste už zaplatili, ozvěte se prosím.`,
    ],
    formalni: [
      `dovolujeme si Vás upozornit, že ${f} je ${d} po splatnosti. Žádáme Vás tímto o její úhradu.`,
      `opakovaně Vás upozorňujeme, že ${f} je ${d} po splatnosti a dosud nebyla uhrazena. Žádáme Vás o úhradu bez zbytečného odkladu.`,
      `${f} je ${d} po splatnosti a přes předchozí upomínky nebyla uhrazena. Žádáme Vás o úhradu nejpozději do 5 pracovních dnů od doručení této upomínky. Pokud byla platba již odeslána, považujte prosím tuto zprávu za bezpředmětnou.`,
    ],
  }
  // po oslovení s čárkou pokračuje dopis malým písmenem, proto texty začínají malým
  const body = `${hi}\n${bodies[tone][lvl - 1]}`
  const prefix = lvl === 1 ? 'Upomínka' : `${lvl}. upomínka`
  return { subject: `${prefix}: faktura č. ${invoiceNumber} je ${d} po splatnosti`, body }
}
