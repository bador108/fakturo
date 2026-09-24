import { Plus, Sparkles, Receipt, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { T, seg, easeOut, typed, czk } from './timeline'

const ROWS = [
  { vendor: 'WeWork', meta: '1. 9. 2026 · Sdílená kancelář, září', cat: ['Kancelář', 'bg-blue-50 text-blue-600'], vat: true, amount: '4 500,00 Kč' },
  { vendor: 'Meta Ads', meta: '12. 9. 2026 · Kampaň na Instagramu', cat: ['Marketing', 'bg-pink-50 text-pink-600'], vat: false, amount: '2 500,00 Kč' },
] as const
const ADOBE = { vendor: 'Adobe', meta: '23. 9. 2026 · Předplatné Creative Cloud', cat: ['Software', 'bg-violet-50 text-violet-600'], vat: false, amount: '899,00 Kč' } as const

function Row({ r }: { r: { vendor: string; meta: string; cat: readonly [string, string]; vat: boolean; amount: string } }) {
  return (
    <div className="flex items-center gap-3 px-6 h-[66px]">
      <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0"><Receipt className="h-4 w-4 text-slate-400" /></div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm">{r.vendor}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{r.meta}</p>
      </div>
      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', r.cat[1])}>{r.cat[0]}</span>
      {r.vat && <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">DPH</span>}
      <span className="w-[96px] text-right font-semibold text-slate-800 text-sm tabular-nums">{r.amount}</span>
    </div>
  )
}

export function ExpensesPage({ t }: { t: number }) {
  const text = typed('Adobe předplatné 899 Kč včera', t, T.quickType)
  const cleared = t >= T.modalIn
  const parsing = t >= T.parse && t < T.modalIn
  const rowP = easeOut(seg(t, T.rowIn))
  const total = 7000 + 899 * rowP

  return (
    <div className="space-y-5 max-w-[824px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Výdaje</h1>
          <p className="text-sm text-slate-400 mt-0.5">Evidence nákladů pro daňové účely</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium"><Plus className="h-4 w-4" />Přidat výdaj</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-700"><Sparkles className="h-4 w-4" />Rychlé zadání</p>
        <p className="text-xs text-slate-400">Vložte text z účtenky nebo e‑mailu (např. „Adobe předplatné 599 Kč včera“) a doplníme pole za vás.</p>
        <div className="flex gap-2">
          <div className={cn('flex-1 flex items-center rounded-lg border px-3 h-10 text-sm', t >= T.quickType[0] - 0.2 && !cleared ? 'border-transparent ring-2 ring-brand' : 'border-slate-200')}>
            {!cleared && text ? <span className="text-slate-900">{text}</span> : <span className="text-slate-300">Adobe předplatné 599 Kč včera…</span>}
          </div>
          <span className={cn('inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium text-white', text && !cleared ? 'bg-brand' : 'bg-slate-400')}>
            {parsing && <Loader2 className="h-4 w-4 animate-spin" />}Rozpoznat
          </span>
        </div>
      </div>

      <div className="inline-block bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
        <p className="text-xs text-slate-400">Celkem výdajů (CZK)</p>
        <p className="text-lg font-bold text-slate-900 tabular-nums">{czk(total)}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {rowP > 0 && (
          <div className="overflow-hidden" style={{ height: 66 * rowP, opacity: rowP, background: `rgba(236,253,245,${0.8 * (1 - seg(t, [T.rowIn[1] + 0.8, T.rowIn[1] + 2]))})` }}>
            <Row r={ADOBE} />
          </div>
        )}
        {ROWS.map(r => <Row key={r.vendor} r={r} />)}
      </div>
    </div>
  )
}

/** Formulář „Přidat výdaj“ s poli, která doplnilo rychlé zadání (přes celé okno appky) */
export function ExpenseModal({ t }: { t: number }) {
  const inP = easeOut(seg(t, [T.modalIn, T.modalIn + 0.3]))
  const outP = seg(t, [T.save + 0.05, T.save + 0.35])
  if (inP <= 0 || outP >= 1) return null
  const flash = t < T.modalIn + 1.1
  const field = (label: string, value: string) => (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <div className={cn('rounded-lg border border-slate-200 px-3 h-9 flex items-center text-sm text-slate-900 transition-colors duration-500', flash ? 'bg-emerald-50' : 'bg-white')}>{value}</div>
    </div>
  )
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30" style={{ opacity: inP * (1 - outP) }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6 space-y-4" style={{ transform: `translateY(${(1 - inP) * 12}px) scale(${0.98 + 0.02 * inP})` }}>
        <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-800">Přidat výdaj</h3><X className="h-4 w-4 text-slate-400" /></div>
        <div className="grid grid-cols-2 gap-3">{field('Datum', '23. 9. 2026')}{field('Kategorie', 'Software')}</div>
        {field('Dodavatel / název', 'Adobe')}
        {field('Popis (volitelné)', 'Předplatné Creative Cloud')}
        <div className="grid grid-cols-2 gap-3">{field('Částka', '899')}{field('Měna', 'CZK')}</div>
        <p className="flex items-center gap-2 text-sm text-slate-600"><span className="h-4 w-4 rounded border border-slate-300" />Uplatnitelné DPH</p>
        <div className="flex justify-end gap-2 pt-1">
          <span className="px-4 py-2 text-sm text-slate-600">Zrušit</span>
          <span className={cn('px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg transition-transform', t >= T.save && t < T.save + 0.12 && 'scale-95')}>{t >= T.save ? 'Ukládám…' : 'Uložit'}</span>
        </div>
      </div>
    </div>
  )
}
