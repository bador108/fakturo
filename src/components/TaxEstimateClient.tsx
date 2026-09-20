'use client'

import { useMemo, useState } from 'react'
import { Calculator, Info } from 'lucide-react'
import { ProUpsell } from '@/components/ProUpsell'
import {
  FLAT_EXPENSE_OPTIONS, calcBreakdown, calcFlatTax, flatExpenses, rulesFor, type Breakdown,
} from '@/lib/taxEstimate'

interface TaxData {
  incomePaid: number
  incomePending: number
  paidCount: number
  expenses: number
  expenseCount: number
  skippedForeign: number
  vatPayer: boolean
}

interface Props {
  isPaidPlan: boolean
  year: number
  yearFraction: number
  data: TaxData | null
}

const money = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })
const fmt = (n: number) => money.format(n)

function parseAmount(v: string): number {
  const n = Number(v.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function NumberField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="relative">
        <input
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Kč</span>
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

export function TaxEstimateClient({ isPaidPlan, year, yearFraction, data }: Props) {
  const { rules, exact } = rulesFor(year)

  const initialProjected = yearFraction >= 0.25
  const scale = (n: number) => Math.round(initialProjected ? n / yearFraction : n)

  const [income, setIncome] = useState(String(data ? scale(data.incomePaid) : 0))
  const [expenses, setExpenses] = useState(String(data ? scale(data.expenses) : 0))
  const [flatPct, setFlatPct] = useState(60)
  const [vatPayer, setVatPayer] = useState(data?.vatPayer ?? false)

  const result = useMemo(() => {
    const inc = parseAmount(income)
    const actual = calcBreakdown(inc, parseAmount(expenses), rules)
    const flatExp = calcBreakdown(inc, flatExpenses(inc, flatPct), rules)
    const flatTax = calcFlatTax(inc, vatPayer, flatPct, rules)
    const options: { key: string; label: string; total: number }[] = [
      { key: 'actual', label: 'Skutečné výdaje', total: actual.total },
      { key: 'flatExp', label: `Výdajový paušál ${flatPct} %`, total: flatExp.total },
    ]
    if (flatTax.eligible) options.push({ key: 'flatTax', label: `Paušální daň (${flatTax.band}. pásmo)`, total: flatTax.yearly })
    const best = options.reduce((a, b) => (b.total < a.total ? b : a))
    return { inc, actual, flatExp, flatTax, options, best }
  }, [income, expenses, flatPct, vatPayer, rules])

  if (!isPaidPlan || !data) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Odhad daní</h1>
          <p className="text-sm text-slate-400 mt-0.5">Kolik zhruba zaplatíš na daních a pojištění</p>
        </div>
        <ProUpsell
          title="Odhad daní a odvodů"
          description="Z tvých faktur a výdajů spočítáme daň z příjmů, sociální a zdravotní pojištění a porovnáme režimy. Součást Start a Pro plánu."
          minPlan="start"
        />
      </div>
    )
  }

  const setActual = () => { setIncome(String(data.incomePaid)); setExpenses(String(data.expenses)) }
  const setProjection = () => { setIncome(String(Math.round(data.incomePaid / yearFraction))); setExpenses(String(Math.round(data.expenses / yearFraction))) }
  const monthly = Math.round(result.best.total / 12)
  const share = result.inc > 0 ? Math.round((result.best.total / result.inc) * 100) : 0

  const rows: { label: string; pick: (b: Breakdown) => number }[] = [
    { label: 'Výdaje', pick: b => b.expenses },
    { label: 'Zisk', pick: b => b.profit },
    { label: 'Daň z příjmů', pick: b => b.incomeTax },
    { label: 'Sociální pojištění', pick: b => b.social },
    { label: 'Zdravotní pojištění', pick: b => b.health },
    { label: 'Celkem za rok', pick: b => b.total },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Odhad daní</h1>
        <p className="text-sm text-slate-400 mt-0.5">Orientační výpočet daně a pojištění za rok {year}</p>
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Je to odhad, ne daňové přiznání. Počítá s hlavní činností, sleva na poplatníka je zahrnutá, žádné další slevy ani odpočty ne.
          U konkrétní situace se poraď s účetní.
        </p>
      </div>

      {!exact && (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          Sazby pro rok {year} zatím nemáme. Počítáme se sazbami pro rok {rules.year}.
        </p>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">Vstupy</h2>
          <div className="flex gap-2 text-xs">
            <button onClick={setActual} className="rounded-md border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 transition">Dosavadní stav</button>
            <button onClick={setProjection} className="rounded-md border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 transition">Odhad na celý rok</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Příjmy za rok (bez DPH)"
            value={income}
            onChange={setIncome}
            hint={`Zaplacené faktury za ${year} (${data.paidCount}) dosud dělají ${fmt(data.incomePaid)}. Čeká na zaplacení ${fmt(data.incomePending)}, to se nepočítá.`}
          />
          <NumberField
            label="Skutečné výdaje za rok"
            value={expenses}
            onChange={setExpenses}
            hint={`Evidované výdaje za ${year} (${data.expenseCount}) dosud dělají ${fmt(data.expenses)}.`}
          />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Výdajový paušál</label>
            <select
              value={flatPct}
              onChange={e => setFlatPct(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {FLAT_EXPENSE_OPTIONS.map(o => <option key={o.pct} value={o.pct}>{o.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer self-end pb-2">
            <input type="checkbox" checked={vatPayer} onChange={e => setVatPayer(e.target.checked)} className="rounded border-slate-300 text-brand" />
            Jsem plátce DPH
          </label>
        </div>

        {data.skippedForeign > 0 && (
          <p className="text-xs text-slate-400">
            Položky v cizí měně se nezapočítaly (celkem {data.skippedForeign}), odhad počítá jen s korunami.
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Calculator className="h-4 w-4" />
          Nejnižší odhad odvodů
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{fmt(result.best.total)}</p>
        <p className="mt-1 text-sm text-slate-500">
          {result.best.label}
          {result.inc > 0 && <> · zhruba {share} % příjmů · odkládej asi <strong className="text-slate-800">{fmt(monthly)}</strong> měsíčně</>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
              <th className="px-5 py-3 font-medium" />
              <th className="px-3 py-3 font-medium text-right">Skutečné výdaje</th>
              <th className="px-3 py-3 font-medium text-right">Paušál {flatPct} %</th>
              <th className="px-5 py-3 font-medium text-right">Paušální daň</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const isTotal = row.label.startsWith('Celkem')
              return (
                <tr key={row.label} className={isTotal ? 'font-semibold text-slate-900 border-t border-slate-100' : 'text-slate-600'}>
                  <td className="px-5 py-2.5">{row.label}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(row.pick(result.actual))}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(row.pick(result.flatExp))}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">
                    {isTotal ? (result.flatTax.eligible ? fmt(result.flatTax.yearly) : 'nelze') : ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!result.flatTax.eligible && result.flatTax.reason && (
          <p className="px-5 py-3 text-xs text-slate-400 border-t border-slate-100">{result.flatTax.reason}</p>
        )}
        {result.flatTax.eligible && (
          <p className="px-5 py-3 text-xs text-slate-400 border-t border-slate-100">
            Paušální daň nahrazuje daň z příjmů i obě pojištění jednou měsíční platbou ({fmt(result.flatTax.yearly / 12)}). Vstup do režimu se oznamuje finančnímu úřadu.
          </p>
        )}
      </div>

      <div className="text-xs text-slate-400 leading-relaxed space-y-1 pb-6">
        <p>
          Sazby {rules.year}: daň z příjmů 15 % do {fmt(rules.higherTaxThreshold)} základu a 23 % nad ním, sleva na poplatníka {fmt(rules.taxpayerCredit)}.
          Pojistné se počítá z poloviny zisku: sociální 29,2 % (minimum {fmt(rules.social.minMonthly)} měsíčně), zdravotní 13,5 % (minimum {fmt(rules.health.minMonthly)} měsíčně).
        </p>
        <p>Příjmy se berou podle data vystavení faktury a stavu zaplaceno. Zálohy na pojištění a daň v průběhu roku tady neřešíme.</p>
      </div>
    </div>
  )
}
