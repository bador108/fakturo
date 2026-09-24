import type { ReminderTone } from '@/types'

// Sdílené nastavení a texty upomínek — cron (lib/reminders.ts), Nastavení i časová osa na faktuře,
// takže klient dostane přesně ten text, který uživatel vidí v náhledu.
// Tón volí uživatel; pořadí upomínky po splatnosti (1.–3.) přitvrzuje, ale zůstává slušné.

export const REMINDER_TONES: { value: ReminderTone; label: string; description: string }[] = [
  { value: 'pratelsky', label: 'Přátelský', description: 'Vlídně, jako mezi známými.' },
  { value: 'vecny', label: 'Věcný', description: 'Krátce a jasně, bez omáčky.' },
  { value: 'formalni', label: 'Formální', description: 'Úřední tón pro firmy a instituce.' },
]

export const DEFAULT_REMINDER_TONE: ReminderTone = 'vecny'

export function isReminderTone(v: unknown): v is ReminderTone {
  return v === 'pratelsky' || v === 'vecny' || v === 'formalni'
}

// Dny se ukládají se znaménkem: kladné = dní PŘED splatností, záporné = dní PO splatnosti
export const REMINDER_DAYS_BEFORE = [1, 3, 7, 14]
export const REMINDER_DAYS_AFTER = [-1, -3, -7, -14, -30]
export const REMINDER_DAY_OPTIONS = [...REMINDER_DAYS_BEFORE, ...REMINDER_DAYS_AFTER]

// 3 dny před splatností + 1., 2. a 3. upomínka 3, 7 a 14 dní po ní
export const DEFAULT_REMINDER_DAYS = [3, -3, -7, -14]

// jak upomínka přitvrzuje: 1. mile, 2. jasněji, 3. a další důrazně
const LEVEL_TAGS = ['mile', 'jasněji', 'důrazně']

/** Seřadí dny chronologicky (od nejdřívější připomínky před splatností). */
export function sortReminderDays(days: number[]): number[] {
  return Array.from(new Set(days)).sort((a, b) => b - a)
}

/** 1 den, 2–4 dny, 5+ dní */
export function daysLabel(n: number): string {
  const a = Math.abs(n)
  return `${a} ${a === 1 ? 'den' : a <= 4 ? 'dny' : 'dní'}`
}

export function dayOptionLabel(d: number): string {
  return `${daysLabel(d)} ${d > 0 ? 'před' : 'po'} splatnosti`
}

/** „1. upomínka — mile“; ordinal 0 = připomínka před splatností */
export function reminderLabel(ordinal: number): string {
  if (ordinal <= 0) return 'Připomínka před splatností'
  return `${ordinal}. upomínka — ${LEVEL_TAGS[Math.min(ordinal, 3) - 1]}`
}

interface ReminderInput {
  tone: ReminderTone
  /** 0 = před splatností, 1+ = kolikátá upomínka po splatnosti (texty od 3. dál zůstávají důrazné) */
  ordinal: number
  /** počet dní do splatnosti (ordinal 0) nebo po splatnosti (1+) */
  days: number
  invoiceNumber: string
  senderName: string
}

export interface ReminderCopy {
  subject: string
  greeting: string
  text: string
}

const OVERDUE_TEXTS: Record<ReminderTone, [string, string, string]> = {
  pratelsky: [
    'jen drobné upozornění — {f} je {d} po splatnosti. Možná to jen zapadlo v e-mailech. Pokud už je platba na cestě, děkujeme a tuto zprávu prosím ignorujte.',
    'ozýváme se znovu — {f} je stále neuhrazena, už {d} po splatnosti. Budeme moc rádi, když ji uhradíte v nejbližších dnech.',
    '{f} je už {d} po splatnosti a platba zatím nedorazila. Prosíme o úhradu do 5 pracovních dnů. Pokud je něco v nepořádku, stačí odpovědět na tento e-mail a domluvíme se.',
  ],
  vecny: [
    'upozorňujeme, že {f} je {d} po splatnosti. Prosíme o její úhradu.',
    '{f} zůstává neuhrazená, je {d} po splatnosti. Prosíme o úhradu v nejbližších dnech.',
    '{f} je {d} po splatnosti a stále není uhrazena. Žádáme o úhradu nejpozději do 5 pracovních dnů od doručení tohoto e-mailu. Pokud jste už zaplatili, ozvěte se prosím.',
  ],
  formalni: [
    'dovolujeme si Vás upozornit, že {f} je {d} po splatnosti. Žádáme Vás tímto o její úhradu.',
    'opakovaně Vás upozorňujeme, že {f} je {d} po splatnosti a dosud nebyla uhrazena. Žádáme Vás o úhradu bez zbytečného odkladu.',
    '{f} je {d} po splatnosti a přes předchozí upomínky nebyla uhrazena. Žádáme Vás o úhradu nejpozději do 5 pracovních dnů od doručení této upomínky. Pokud byla platba již odeslána, považujte prosím tuto zprávu za bezpředmětnou.',
  ],
}

const BEFORE_TEXTS: Record<ReminderTone, string> = {
  pratelsky: 'jen připomínáme, že {f} bude splatná za {d}. Děkujeme!',
  vecny: 'připomínáme, že {f} bude splatná za {d}.',
  formalni: 'dovolujeme si Vám připomenout, že {f} bude splatná za {d}.',
}

/** Předmět a text upomínky (prostý text; po oslovení s čárkou pokračuje dopis malým písmenem). */
export function buildReminder({ tone, ordinal, days, invoiceNumber, senderName }: ReminderInput): ReminderCopy {
  const d = daysLabel(days)
  const fill = (t: string) => t.replace('{f}', `faktura č. ${invoiceNumber} od ${senderName}`).replace('{d}', d)
  const greeting = tone === 'formalni' ? 'Vážená paní, vážený pane,' : 'Dobrý den,'

  if (ordinal <= 0) {
    return { subject: `Připomínka: faktura č. ${invoiceNumber} je splatná za ${d}`, greeting, text: fill(BEFORE_TEXTS[tone]) }
  }

  const text = fill(OVERDUE_TEXTS[tone][Math.min(ordinal, 3) - 1])
  const prefix = ordinal === 1 ? 'Upomínka' : `${ordinal}. upomínka`
  return { subject: `${prefix}: faktura č. ${invoiceNumber} je ${d} po splatnosti`, greeting, text }
}
