import { Plus, Search, FileText, Building2, Mail, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { T, seg, typed } from './timeline'

const INVOICES = [
  { name: 'Café Novus s.r.o.', meta: '#2026/044 · 24. 9. 2026 · 8. 10. 2026', status: 'draft', total: '10 890,00 Kč' },
  { name: 'Zelený ateliér', meta: '#2026/043 · 24. 9. 2026 · 8. 10. 2026', status: 'sent', total: '15 730,00 Kč' },
  { name: 'Studio Pixel s.r.o.', meta: '#2026/042 · 24. 9. 2026 · 4. 10. 2026', status: 'paid', total: '24 850,00 Kč' },
  { name: 'Atelier Holub', meta: '#2026/041 · 10. 9. 2026 · 24. 9. 2026', status: 'paid', total: '18 200,00 Kč' },
  { name: 'Káva & Kód', meta: '#2026/040 · 2. 9. 2026 · 16. 9. 2026', status: 'paid', total: '12 000,00 Kč' },
  { name: 'Pekárna U Mlýna s.r.o.', meta: '#2026/039 · 28. 8. 2026 · 11. 9. 2026', status: 'overdue', total: '12 400,00 Kč' },
] as const

const BADGE = {
  draft: ['Koncept', 'bg-slate-100 text-slate-500'],
  sent: ['Odesláno', 'bg-blue-50 text-blue-600'],
  paid: ['Zaplaceno', 'bg-emerald-50 text-emerald-600'],
  overdue: ['Po splatnosti', 'bg-red-50 text-red-600'],
} as const

const TABS = [['all', 'Vše', 6], ['sent', 'Odesláno', 1], ['paid', 'Zaplaceno', 3], ['overdue', 'Po splatnosti', 1], ['draft', 'Koncepty', 1], ['nabidka', 'Nabídky', 0]] as const

export function InvoicesPage({ t }: { t: number }) {
  const filtered = t >= T.filterOverdue
  const hide = seg(t, [T.filterOverdue, T.filterOverdue + 0.35])
  const active = filtered ? 'overdue' : 'all'
  return (
    <div className="space-y-5 max-w-[824px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Faktury</h1>
        <span className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium"><Plus className="h-4 w-4" />Nová faktura</span>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-100">
          {TABS.map(([id, label, n]) => (
            <span key={id} data-tab={id} className={cn('flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap', active === id ? 'border-brand text-brand' : 'border-transparent text-slate-500')}>
              {label}{n > 0 && <span className={cn('text-xs px-1.5 py-0.5 rounded-full', active === id ? 'bg-brand-soft text-brand' : 'bg-slate-100 text-slate-400')}>{n}</span>}
            </span>
          ))}
        </div>
        <div className="px-4 py-3 border-b border-slate-50">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-400"><Search className="h-4 w-4" />Hledat klienta nebo číslo faktury…</div>
        </div>
        <div className="divide-y divide-slate-50">
          {INVOICES.map(inv => {
            const out = inv.status !== 'overdue' ? hide : 0
            if (out >= 1) return null
            const [label, cls] = BADGE[inv.status]
            return (
              <div key={inv.name} className="flex items-center gap-3 px-6 overflow-hidden" style={{ height: 66 * (1 - out), opacity: 1 - out }}>
                <div className="h-9 w-9 bg-brand-soft rounded-xl flex items-center justify-center shrink-0"><FileText className="h-4 w-4 text-indigo-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{inv.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{inv.meta}</p>
                </div>
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', cls)}>{label}</span>
                <span className="w-[104px] text-right font-semibold text-slate-800 text-sm tabular-nums">{inv.total}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const CLIENTS = [
  { name: 'Studio Pixel s.r.o.', ico: '31415926', email: 'fakturace@studiopixel.cz', city: 'Praha 3' },
  { name: 'Zelený ateliér', ico: '16180339', email: 'info@zelenyatelier.cz', city: 'Brno' },
  { name: 'Atelier Holub', ico: '14142135', email: 'ahoj@atelierholub.cz', city: 'Praha 7' },
  { name: 'Káva & Kód', ico: '17320508', email: 'faktury@kavaakod.cz', city: 'Olomouc' },
  { name: 'Pekárna U Mlýna s.r.o.', ico: '22360679', email: 'ucetni@pekarnaumlyna.cz', city: 'Kolín' },
  { name: 'Café Novus s.r.o.', ico: '26457513', email: 'info@cafenovus.cz', city: 'Plzeň' },
]

export function ClientsPage({ t }: { t: number }) {
  const q = typed('pix', t, T.searchType)
  const typing = t >= T.searchType[0] - 0.3
  const hide = seg(t, [T.searchType[1], T.searchType[1] + 0.3])
  const hover = t >= T.searchType[1] + 0.9 && t < 14.4
  return (
    <div className="space-y-5 max-w-[824px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Klienti</h1>
          <p className="text-sm text-slate-400 mt-0.5">6 klientů celkem</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium"><Plus className="h-4 w-4" />Nový klient</span>
      </div>
      <div className={cn('flex items-center gap-2 pl-3 pr-4 py-2.5 text-sm border rounded-xl bg-white', typing ? 'border-transparent ring-2 ring-brand-soft' : 'border-slate-200')}>
        <Search className="h-4 w-4 text-slate-400" />
        {q ? <span className="text-slate-900">{q}</span> : <span className="text-slate-400">Hledat klienta, IČO, email…</span>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {CLIENTS.map((c, i) => {
          const out = i > 0 ? hide : 0
          if (out >= 1) return null
          const hov = i === 0 && hover
          return (
            <div key={c.name} className={cn('bg-white rounded-2xl border border-slate-100 p-4 transition-shadow', hov ? 'shadow-md' : 'shadow-sm')} style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.04})` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 bg-brand-soft rounded-xl flex items-center justify-center text-brand font-bold text-sm">{c.name[0]}</div>
                <div className={cn('flex gap-1 transition-opacity', hov ? 'opacity-100' : 'opacity-0')}><Pencil className="h-7 w-7 p-2 text-slate-400" /><Trash2 className="h-7 w-7 p-2 text-slate-400" /></div>
              </div>
              <p className="font-medium text-slate-800 text-sm truncate">{c.name}</p>
              <div className="mt-1.5 space-y-1 text-xs text-slate-400">
                <p className="flex items-center gap-1"><Building2 className="h-3 w-3" />IČO {c.ico}</p>
                <p className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" />{c.email}</p>
                <p>{c.city}</p>
              </div>
              <p className="mt-3 text-xs font-medium text-brand">Faktury →</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
