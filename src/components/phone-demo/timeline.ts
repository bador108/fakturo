// Časová osa ukázky v telefonu (sekundy). Celá ukázka je čistá funkce času `t`,
// takže obrazovky, kurzor prstu i popisky vedle telefonu jsou vždy v souladu.

export const LOOP = 18

export const T = {
  statsIn: [0.2, 1.5],
  chartIn: [0.5, 1.8],
  tapMenu: 2.3,
  drawer: [2.45, 2.8],
  tapNew: 3.2,
  toForm: 3.5,
  scrollToClient: [3.75, 4.05],
  icoType: [4.15, 4.8],
  tapAres: 5.0,
  aresDone: 5.45,
  emailType: [5.6, 6.3],
  scrollDown: [6.5, 6.95],
  descType: [7.05, 7.6],
  priceType: [7.7, 8.15],
  scrollUp: [8.4, 8.8],
  tapSend: 9.0,
  toList: 9.45,
  toast: [9.8, 11.3],
  push: [11.1, 13.2],
  paid: 11.9,
  tapPush: 12.7,
  toDash: 13.1,
  revenueUp: [13.7, 14.9],
  fadeOut: [17.3, LOOP],
} as const

export type Scene = 'dash' | 'form' | 'list' | 'dash-paid'

export function sceneAt(t: number): Scene {
  if (t < T.toForm) return 'dash'
  if (t < T.toList) return 'form'
  if (t < T.toDash) return 'list'
  return 'dash-paid'
}

// kroky v popisku vedle telefonu
export const STEPS = [
  { from: 0, title: 'Přehled', text: 'Na jedné obrazovce vidíš, co je zaplacené a co ještě čeká.' },
  { from: T.toForm, title: 'Nová faktura', text: 'Zadáš IČO, zbytek doplní ARES. Pak jen položka a cena.' },
  { from: T.toList, title: 'Odesláno', text: 'Faktura s QR platbou odchází klientovi rovnou e‑mailem.' },
  { from: T.paid, title: 'Zaplaceno', text: 'Platba se spáruje sama a přehled se hned přepočítá.' },
] as const

export function stepAt(t: number): number {
  let i = 0
  STEPS.forEach((s, j) => { if (t >= s.from) i = j })
  return i
}

/** 0 → 1 mezi a a b (mimo interval zafixováno) */
export function seg(t: number, [a, b]: readonly [number, number]): number {
  return Math.min(1, Math.max(0, (t - a) / (b - a)))
}

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/** Postupně psaný text: kolik znaků je v čase t napsaných */
export function typed(text: string, t: number, range: readonly [number, number]): string {
  return text.slice(0, Math.round(text.length * seg(t, range)))
}

const czkFmt = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 2 })
export const czk = (n: number) => czkFmt.format(n)
