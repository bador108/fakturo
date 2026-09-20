// Orientační odhad daně z příjmů a odvodů OSVČ (hlavní činnost, bez dalších slev).
// Čísla platí pro rok 2026. Ověřeno u Finanční správy (sazby, 36násobek průměrné mzdy, sleva na
// poplatníka, paušální režim) a v přehledech minimálních záloh. Minimální zálohy na sociální
// pojištění se v roce 2026 od července snížily z 5 720 na 5 005 Kč (zpětně od ledna), proto je tady
// už nová hodnota. Pro další roky je potřeba doplnit novou položku v RULES.

export interface TaxRules {
  year: number
  averageWage: number
  incomeTaxRate: number
  higherTaxRate: number
  higherTaxThreshold: number
  taxpayerCredit: number
  social: { rate: number; baseShare: number; minMonthly: number; maxBase: number }
  health: { rate: number; baseShare: number; minMonthly: number }
  flatTaxMonthly: [number, number, number]
  flatTaxLimits: [number, number, number]
}

const AVERAGE_WAGE_2026 = 48_967

export const RULES: Record<number, TaxRules> = {
  2026: {
    year: 2026,
    averageWage: AVERAGE_WAGE_2026,
    incomeTaxRate: 0.15,
    higherTaxRate: 0.23,
    higherTaxThreshold: 36 * AVERAGE_WAGE_2026,
    taxpayerCredit: 30_840,
    social: { rate: 0.292, baseShare: 0.5, minMonthly: 5_005, maxBase: 48 * AVERAGE_WAGE_2026 },
    health: { rate: 0.135, baseShare: 0.5, minMonthly: 3_306 },
    flatTaxMonthly: [9_162, 16_745, 27_139],
    flatTaxLimits: [1_000_000, 1_500_000, 2_000_000],
  },
}

export const LATEST_RULES_YEAR = 2026

export function rulesFor(year: number): { rules: TaxRules; exact: boolean } {
  const exact = year in RULES
  return { rules: exact ? RULES[year] : RULES[LATEST_RULES_YEAR], exact }
}

// Výdajový paušál: procento z příjmů a strop příjmů, ze kterého se počítá.
export const FLAT_EXPENSE_OPTIONS = [
  { pct: 80, cap: 1_600_000, label: '80 % (zemědělství, řemeslné živnosti)' },
  { pct: 60, cap: 1_200_000, label: '60 % (ostatní živnosti)' },
  { pct: 40, cap: 800_000, label: '40 % (svobodná povolání, autorské honoráře)' },
  { pct: 30, cap: 600_000, label: '30 % (příjmy z nájmu)' },
] as const

export interface Breakdown {
  expenses: number
  profit: number
  incomeTax: number
  social: number
  health: number
  total: number
}

const roundDown100 = (n: number) => Math.floor(n / 100) * 100

export function calcBreakdown(income: number, expenses: number, rules: TaxRules): Breakdown {
  const profit = Math.max(0, income - expenses)

  const taxBase = roundDown100(profit)
  const rawTax =
    rules.incomeTaxRate * Math.min(taxBase, rules.higherTaxThreshold) +
    rules.higherTaxRate * Math.max(0, taxBase - rules.higherTaxThreshold)
  const incomeTax = Math.max(0, Math.ceil(rawTax - rules.taxpayerCredit))

  const socialBase = Math.min(profit * rules.social.baseShare, rules.social.maxBase)
  const social = Math.max(Math.ceil(socialBase * rules.social.rate), rules.social.minMonthly * 12)

  const healthBase = profit * rules.health.baseShare
  const health = Math.max(Math.ceil(healthBase * rules.health.rate), rules.health.minMonthly * 12)

  return { expenses, profit, incomeTax, social, health, total: incomeTax + social + health }
}

export function flatExpenses(income: number, pct: number): number {
  const option = FLAT_EXPENSE_OPTIONS.find(o => o.pct === pct) ?? FLAT_EXPENSE_OPTIONS[1]
  return Math.min(income, option.cap) * (option.pct / 100)
}

export interface FlatTaxResult {
  eligible: boolean
  band: 1 | 2 | 3 | null
  yearly: number
  reason?: string
}

// Paušální daň nahrazuje daň z příjmů i obě pojištění jednou měsíční platbou. Pásma podle příjmů;
// druhé pásmo navíc vyžaduje, aby aspoň 75 % příjmů měly výdajový paušál 80 nebo 60 %.
export function calcFlatTax(income: number, vatPayer: boolean, flatPct: number, rules: TaxRules): FlatTaxResult {
  if (vatPayer) return { eligible: false, band: null, yearly: 0, reason: 'Plátce DPH nemůže do paušálního režimu.' }
  const [l1, l2, l3] = rules.flatTaxLimits
  if (income <= l1) return { eligible: true, band: 1, yearly: rules.flatTaxMonthly[0] * 12 }
  if (income <= l2) {
    if (flatPct >= 60) return { eligible: true, band: 2, yearly: rules.flatTaxMonthly[1] * 12 }
    return { eligible: false, band: null, yearly: 0, reason: 'Nad 1 mil. Kč jsou pro paušální režim potřeba příjmy převážně s paušálem 80 nebo 60 %.' }
  }
  if (income <= l3) return { eligible: true, band: 3, yearly: rules.flatTaxMonthly[2] * 12 }
  return { eligible: false, band: null, yearly: 0, reason: 'Příjmy nad 2 mil. Kč se do paušálního režimu nevejdou.' }
}
