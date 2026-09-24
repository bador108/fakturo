import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react'
import { AppTopBar, AccountRow, AppDrawer } from './AppChrome'
import { T, seg, easeOut, czk } from './timeline'

const MONTHS = ['říj', 'lis', 'pro', 'led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář']
const REVENUE = [22, 31, 18, 26, 34, 29, 38, 27, 33, 41, 45, 51]
const EXPENSES = [6, 8, 5, 7, 9, 6, 10, 7, 8, 9, 11, 8]
const PAYMENT = 24850

/** Přehled z (dashboard)/dashboard — `paid` = verze po přijetí platby 2026/042 */
export function DashboardScreen({ t, paid }: { t: number; paid: boolean }) {
  const inP = paid ? 1 : easeOut(seg(t, T.statsIn))
  const payP = paid ? easeOut(seg(t, T.revenueUp)) : 0
  const revenue = 51300 * inP + PAYMENT * payP
  const stats = [
    { title: 'Celkové příjmy', value: czk(revenue), color: '#16a34a', Icon: TrendingUp },
    { title: 'Celkové výdaje', value: czk(7899 * inP), color: '#f43f5e', Icon: TrendingDown },
    { title: 'Čistý zisk', value: `+${czk(43401 * inP + PAYMENT * payP)}`, color: '#059669', Icon: Wallet, green: true },
    { title: 'Čeká na platbu', value: czk(24200 * inP), color: '#ef4444', Icon: AlertCircle },
  ]
  const drawerP = paid ? 0 : easeOut(seg(t, T.drawer))

  return (
    <div className="absolute inset-0 bg-paper flex flex-col pt-[47px]">
      <AppTopBar />
      <div className="px-4 pt-4">
        <AccountRow />
        <h1 className="text-2xl font-semibold text-slate-900">Přehled</h1>
        <p className="text-sm text-slate-400 mt-0.5">Pro plán · neomezené faktury</p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {stats.map(({ title, value, color, Icon, green }, i) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4" style={{ opacity: paid ? 1 : seg(t, [0.1 + i * 0.08, 0.5 + i * 0.08]) }}>
              <p className="text-[13px] font-semibold text-slate-800">{title}</p>
              <div className="h-8 w-8 rounded-full flex items-center justify-center mt-3 mb-2" style={{ backgroundColor: color }}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className={`text-[15px] font-bold tabular-nums ${green ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
              {paid && i === 0 && payP > 0 && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5" style={{ opacity: seg(t, [T.revenueUp[0], T.revenueUp[0] + 0.3]) }}>
                  +24 850 Kč dnes
                </span>
              )}
            </div>
          ))}
        </div>

        <RevenueChart t={t} paid={paid} payP={payP} />
      </div>
      <AppDrawer p={drawerP} pressCta={t >= T.tapNew && t < T.toForm} />
    </div>
  )
}

function RevenueChart({ t, paid, payP }: { t: number; paid: boolean; payP: number }) {
  const grow = paid ? 1 : easeOut(seg(t, T.chartIn))
  const max = 80
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mt-3">
      <p className="text-[13px] font-semibold text-slate-800">Příjmy vs. výdaje</p>
      <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#16a34a]" />Příjmy</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#fb7185]" />Výdaje</span>
      </div>
      <div className="flex items-end justify-between h-[128px] mt-3 border-b border-slate-100">
        {MONTHS.map((m, i) => {
          const last = i === MONTHS.length - 1
          const rev = REVENUE[i] + (last ? 24.85 * payP : 0)
          const d = Math.max(0, grow * 1.6 - i * 0.05)
          const k = Math.min(1, d)
          return (
            <div key={m} className="flex items-end gap-[2px]">
              <span className={`w-[9px] rounded-t-[3px] ${last && paid ? 'bg-emerald-500' : 'bg-[#16a34a]'}`} style={{ height: (rev / max) * 124 * k }} />
              <span className="w-[5px] rounded-t-[2px] bg-[#fb7185]" style={{ height: (EXPENSES[i] / max) * 124 * k }} />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-1.5 text-[9px] text-slate-400">
        {MONTHS.map(m => <span key={m} className="w-[16px] text-center">{m}</span>)}
      </div>
    </div>
  )
}
