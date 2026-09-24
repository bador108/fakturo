import { Plus, Search, FileText, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppTopBar, AccountRow } from './AppChrome'
import { T, seg, easeOut } from './timeline'

const ROWS = [
  { name: 'Atelier Holub', meta: '#2026/041 · 10. 9. 2026 · 24. 9. 2026', status: 'paid', total: '18 200,00 Kč' },
  { name: 'Káva & Kód', meta: '#2026/040 · 2. 9. 2026 · 16. 9. 2026', status: 'paid', total: '12 000,00 Kč' },
  { name: 'Pekárna U Mlýna s.r.o.', meta: '#2026/039 · 28. 8. 2026 · 11. 9. 2026', status: 'overdue', total: '12 400,00 Kč' },
] as const

const BADGE = {
  sent: ['Odesláno', 'bg-blue-50 text-blue-600'],
  paid: ['Zaplaceno', 'bg-emerald-50 text-emerald-600'],
  overdue: ['Po splatnosti', 'bg-red-50 text-red-600'],
} as const

function Row({ name, meta, status, total, pop }: { name: string; meta: string; status: keyof typeof BADGE; total: string; pop?: number }) {
  const [label, cls] = BADGE[status]
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="h-9 w-9 bg-brand-soft rounded-xl flex items-center justify-center shrink-0"><FileText className="h-4 w-4 text-indigo-400" /></div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{meta}</p>
      </div>
      <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium shrink-0', cls)} style={{ transform: `scale(${1 + 0.18 * (pop ?? 0)})` }}>{label}</span>
      <span className="font-semibold text-slate-800 text-[13px] shrink-0 tabular-nums">{total}</span>
    </div>
  )
}

/** Stránka Faktury: nová 2026/042 přibude nahoru, po platbě se přepne na Zaplaceno */
export function ListScreen({ t }: { t: number }) {
  const inP = easeOut(seg(t, [T.toList + 0.2, T.toList + 0.65]))
  const paid = t >= T.paid
  const pop = paid ? Math.sin(Math.PI * seg(t, [T.paid, T.paid + 0.35])) : 0
  const toast = seg(t, [T.toast[0], T.toast[0] + 0.3]) * (1 - seg(t, [T.toast[1] - 0.3, T.toast[1]]))
  const tabs = [['Vše', 4], ['Odesláno', paid ? 0 : 1], ['Zaplaceno', paid ? 3 : 2], ['Po splatnosti', 1]] as const

  return (
    <div className="absolute inset-0 bg-paper flex flex-col pt-[47px]">
      <AppTopBar />
      <div className="px-4 pt-4 space-y-6">
        <div>
          <AccountRow />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Faktury</h1>
            <span className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium"><Plus className="h-4 w-4" />Nová faktura</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-100 overflow-hidden">
            {tabs.map(([label, n], i) => (
              <span key={label} className={cn('flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-medium border-b-2 whitespace-nowrap', i === 0 ? 'border-brand text-brand' : 'border-transparent text-slate-500')}>
                {label}{n > 0 && <span className={cn('text-xs px-1.5 py-0.5 rounded-full', i === 0 ? 'bg-brand-soft text-brand' : 'bg-slate-100 text-slate-400')}>{n}</span>}
              </span>
            ))}
          </div>
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-400"><Search className="h-4 w-4" />Hledat klienta nebo číslo faktury…</div>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="overflow-hidden" style={{ maxHeight: 72 * inP, opacity: inP, background: `rgba(236,253,245,${0.7 * (1 - seg(t, [T.toList + 1, T.toList + 2.2]))})` }}>
              <Row name="Studio Pixel s.r.o." meta="#2026/042 · 24. 9. 2026 · 4. 10. 2026" status={paid ? 'paid' : 'sent'} total="24 850,00 Kč" pop={pop} />
            </div>
            {ROWS.map(r => <Row key={r.name} {...r} />)}
          </div>
        </div>
      </div>
      {toast > 0 && (
        <div className="absolute left-4 right-4 bottom-10 flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl" style={{ opacity: toast, transform: `translateY(${(1 - toast) * 16}px)` }}>
          <span className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><Check className="h-3.5 w-3.5" /></span>
          <span className="text-sm">Faktura odeslána na fakturace@studiopixel.cz</span>
        </div>
      )}
    </div>
  )
}
