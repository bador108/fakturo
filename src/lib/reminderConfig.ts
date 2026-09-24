// Sdílené nastavení upomínek — používá cron (lib/reminders.ts) i náhled v Nastavení,
// takže klient dostane přesně ten text, který uživatel vidí v náhledu.

export type ReminderTone = 'friendly' | 'neutral' | 'firm'

export const DEFAULT_REMINDER_TONE: ReminderTone = 'neutral'

export const REMINDER_TONES: { value: ReminderTone; label: string; hint: string }[] = [
  { value: 'friendly', label: 'Přátelský', hint: 'Mile a s pochopením. Pro stálé klienty.' },
  { value: 'neutral', label: 'Věcný', hint: 'Zdvořile a k věci. Výchozí volba.' },
  { value: 'firm', label: 'Důrazný', hint: 'Jasně a bez vytáček. Když už to trvá.' },
]

export function isReminderTone(v: unknown): v is ReminderTone {
  return v === 'friendly' || v === 'neutral' || v === 'firm'
}

// Dny se ukládají se znaménkem: kladné = dní PŘED splatností, záporné = dní PO splatnosti
export const REMINDER_DAYS_BEFORE = [14, 7, 3, 1]
export const REMINDER_DAYS_AFTER = [-1, -3, -7, -14, -30]
export const REMINDER_DAY_OPTIONS = [...REMINDER_DAYS_BEFORE, ...REMINDER_DAYS_AFTER]

export const DEFAULT_REMINDER_DAYS = [3, -1, -7, -14]

export const REMINDER_PRESETS: { id: string; label: string; days: number[] }[] = [
  { id: 'off', label: 'Vypnuto', days: [] },
  { id: 'rare', label: 'Zřídka', days: [3, -7, -30] },
  { id: 'normal', label: 'Běžně', days: DEFAULT_REMINDER_DAYS },
  { id: 'often', label: 'Často', days: [7, 3, 1, -1, -3, -7, -14, -30] },
]

/** Seřadí dny chronologicky (od nejdřívější upomínky před splatností). */
export function sortReminderDays(days: number[]): number[] {
  return Array.from(new Set(days)).sort((a, b) => b - a)
}

/** Vrátí id presetu, který přesně odpovídá výběru, jinak null (= vlastní). */
export function matchPreset(days: number[]): string | null {
  const key = sortReminderDays(days).join(',')
  return REMINDER_PRESETS.find(p => sortReminderDays(p.days).join(',') === key)?.id ?? null
}

/** 1 den, 2–4 dny, 5+ dní */
export function daysLabel(n: number): string {
  const a = Math.abs(n)
  return `${a} ${a === 1 ? 'den' : a <= 4 ? 'dny' : 'dní'}`
}

export function dayOptionLabel(d: number): string {
  return `${daysLabel(d)} ${d > 0 ? 'před' : 'po'} splatnosti`
}

interface CopyInput {
  tone: ReminderTone
  invoiceNumber: string
  senderName: string
  /** kladné = do splatnosti zbývá, záporné = po splatnosti */
  daysToDue: number
}

export interface ReminderCopy {
  subject: string
  intro: string
  outro: string
}

/** Předmět a text upomínky pro zvolený tón (prostý text, escapuje se až při skládání HTML). */
export function reminderCopy({ tone, invoiceNumber: n, senderName: s, daysToDue }: CopyInput): ReminderCopy {
  const d = daysLabel(daysToDue)
  const overdue = daysToDue < 0

  if (tone === 'friendly') {
    return overdue
      ? {
          subject: `Faktura č. ${n} možná zapadla`,
          intro: `možná to jen zapadlo v poště: faktura č. ${n} od ${s} je ${d} po splatnosti.`,
          outro: 'Budeme rádi, když ji uhradíte, jakmile to půjde. Pokud už je zaplaceno, děkujeme a tento e-mail prosím ignorujte.',
        }
      : {
          subject: `Malá připomínka k faktuře č. ${n}`,
          intro: `jen drobná připomínka: faktura č. ${n} od ${s} bude splatná za ${d}.`,
          outro: 'Pokud už je zaplaceno, tento e-mail prosím ignorujte. Děkujeme!',
        }
  }

  if (tone === 'firm') {
    return overdue
      ? {
          subject: `Důrazná upomínka: faktura č. ${n} je ${d} po splatnosti`,
          intro: `faktura č. ${n} od ${s} je ${d} po splatnosti a dosud nebyla uhrazena.`,
          outro: 'Žádáme o okamžitou úhradu. Pokud platbu neobdržíme, budeme nuceni přistoupit k dalším krokům.',
        }
      : {
          subject: `Faktura č. ${n} je splatná za ${d}`,
          intro: `faktura č. ${n} od ${s} je splatná za ${d}.`,
          outro: 'Žádáme o úhradu nejpozději v den splatnosti.',
        }
  }

  return overdue
    ? {
        subject: `Upomínka: faktura č. ${n} je ${d} po splatnosti`,
        intro: `upozorňujeme, že faktura č. ${n} od ${s} je ${d} po splatnosti.`,
        outro: 'Prosíme o její úhradu. Pokud jste platbu již odeslali, považujte tento e-mail za bezpředmětný.',
      }
    : {
        subject: `Připomínka: faktura č. ${n} je splatná za ${d}`,
        intro: `připomínáme, že faktura č. ${n} od ${s} bude splatná za ${d}.`,
        outro: 'Děkujeme za včasnou úhradu.',
      }
}
