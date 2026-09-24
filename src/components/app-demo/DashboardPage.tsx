import { TrendingUp, TrendingDown, Wallet, Receipt, AlertCircle, Pencil } from 'lucide-react'
import { T, seg, easeOut, czk } from './timeline'

const MONTHS = ['říj', 'lis', 'pro', 'led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář']
const REVENUE = [22, 31, 18, 26, 34, 29, 38, 27, 33, 41, 45, 76]
const EXPENSES = [6, 8, 5, 7, 9, 6, 10, 7, 8, 9, 11, 8]
const CATS = [
  { label: 'Kancelář', amount: 4500, color: '#3b82f6' },
  { label: 'Marketing', amount: 2500, color: '#ec4899' },
  { label: 'Software', amount: 899, color: '#8b5cf6' },
]

/** Přehled z (dashboard)/dashboard ve výchozím rozložení FinanceDashboardGrid */
export function DashboardPage({ t }: { t: number }) {
  const k = easeOut(seg(t, T.statsIn))
  const stats = [
    { title: 'Celkové příjmy', value: czk(76150 * k), color: '#16a34a', Icon: TrendingUp },
    { title: 'Celkové výdaje', value: czk(7899 * k), color: '#f43f5e', Icon: TrendingDown },
    { title: 'Čistý zisk', value: `+${czk(68251 * k)}`, color: '#059669', Icon: Wallet, green: true },
    { title: 'DPH k odvodu', value: czk(0), color: '#d97706', Icon: Receipt },
    { title: 'Čeká na platbu', value: czk(28130 * k), color: '#ef4444', Icon: AlertCircle },
  ]
  const grow = easeOut(seg(t, T.chartIn))

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Přehled</h1>
          <p className="text-sm text-slate-400 mt-0.5">Pro plán · neomezené faktury</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600"><Pencil className="h-3 w-3" />Upravit rozložení</span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {stats.map(({ title, value, color, Icon, green }, i) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4" style={{ opacity: seg(t, [0.05 + i * 0.07, 0.45 + i * 0.07]) }}>
            <p className="text-[13px] font-semibold text-slate-800">{title}</p>
            <div className="h-8 w-8 rounded-full flex items-center justify-center mt-4 mb-2" style={{ backgroundColor: color }}><Icon className="h-4 w-4 text-white" /></div>
            <p className={`text-[15px] font-bold tabular-nums ${green ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-[13px] font-semibold text-slate-800">Příjmy vs. výdaje</p>
          <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#16a34a]" />Příjmy</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#fb7185]" />Výdaje</span>
          </div>
          <div className="relative flex items-end justify-between h-[180px] mt-3 px-1 border-b border-slate-100">
            {[0.25, 0.5, 0.75].map(y => <span key={y} className="absolute inset-x-0 border-t border-slate-50" style={{ bottom: `${y * 100}%` }} />)}
            {MONTHS.map((m, i) => {
              const b = Math.min(1, Math.max(0, grow * 1.6 - i * 0.05))
              return (
                <div key={m} className="relative flex items-end gap-[3px]">
                  <span className="w-[14px] rounded-t-[3px] bg-[#16a34a]" style={{ height: (REVENUE[i] / 80) * 176 * b }} />
                  <span className="w-[8px] rounded-t-[2px] bg-[#fb7185]" style={{ height: (EXPENSES[i] / 80) * 176 * b }} />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 px-1 text-[10px] text-slate-400">{MONTHS.map(m => <span key={m} className="w-[25px] text-center">{m}</span>)}</div>
        </div>
        <CategoryDonut p={grow} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-[13px] font-semibold text-slate-800">Měsíční přehled</p>
        <div className="grid grid-cols-5 mt-3 text-xs text-slate-400"><span>Měsíc</span><span>Faktur</span><span>Fakturováno</span><span>Zaplaceno</span><span className="text-right">Po splatnosti</span></div>
      </div>
    </div>
  )
}

function CategoryDonut({ p }: { p: number }) {
  const total = CATS.reduce((s, c) => s + c.amount, 0)
  const C = 2 * Math.PI * 52
  let offset = 0
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <p className="text-[13px] font-semibold text-slate-800">Výdaje podle kategorií</p>
      <div className="flex items-center gap-6 mt-5">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90 shrink-0">
          {CATS.map(c => {
            const len = (c.amount / total) * C * p
            const el = <circle key={c.label} cx="70" cy="70" r="52" fill="none" stroke={c.color} strokeWidth="22" strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset} />
            offset += (c.amount / total) * C * p
            return el
          })}
        </svg>
        <ul className="space-y-2 text-xs">
          {CATS.map(c => (
            <li key={c.label} className="flex items-center gap-2 text-slate-600">
              <i className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              <span className="w-16">{c.label}</span>
              <span className="font-semibold text-slate-800 tabular-nums">{czk(c.amount).replace(',00', '')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
