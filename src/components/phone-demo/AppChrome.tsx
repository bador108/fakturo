import Image from 'next/image'
import { Menu, X, Plus, LayoutDashboard, FileText, Users, Receipt, Calculator, RefreshCw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mobilní rozvržení appky tak, jak ho kreslí Sidebar.tsx + (dashboard)/layout.tsx
const SURFACE = '#fffcf6'
const BORDER = 'rgba(220,215,200,0.7)'

export function AppTopBar() {
  return (
    <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
      <Image src="/logo.png" alt="" width={112} height={23} />
      <span className="h-10 w-10 flex items-center justify-center text-slate-900"><Menu className="h-5 w-5" /></span>
    </div>
  )
}

export function AccountRow() {
  return (
    <div className="flex justify-end items-center gap-2 mb-4">
      <div className="text-right leading-tight">
        <p className="text-xs font-semibold text-slate-800">Jana</p>
        <p className="text-[11px] text-slate-400">Pro plán</p>
      </div>
      <span className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700" />
    </div>
  )
}

const NAV = [
  { title: 'Hlavní', items: [['Přehled', LayoutDashboard], ['Faktury', FileText], ['Klienti', Users], ['Výdaje', Receipt]] },
  { title: 'Nástroje', items: [['Odhad daní', Calculator], ['Opakující se', RefreshCw]] },
  { title: 'Systém', items: [['Nastavení', Settings]] },
] as const

/** Mobilní menu (p = 0 zavřené → 1 otevřené), `pressCta` = prst drží „Nová faktura“ */
export function AppDrawer({ p, pressCta }: { p: number; pressCta: boolean }) {
  if (p <= 0) return null
  return (
    <div className="absolute inset-0 z-20">
      <div className="absolute inset-0 bg-black/30" style={{ opacity: p }} />
      <div
        className="absolute left-0 top-0 bottom-0 w-[288px] flex flex-col px-4 pt-[71px] gap-5 shadow-2xl"
        style={{ background: SURFACE, transform: `translateX(${(p - 1) * 100}%)` }}
      >
        <div className="px-3 flex items-center justify-between">
          <Image src="/logo.png" alt="" width={112} height={23} />
          <X className="h-4 w-4 text-slate-500" />
        </div>
        <div className="px-1">
          <div
            className={cn('flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-transform', pressCta && 'scale-[0.97]')}
            style={{ height: 44, background: '#15803d', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 20px rgba(21,128,61,0.25)' }}
          >
            <Plus className="h-4 w-4" /> Nová faktura
          </div>
        </div>
        <nav>
          {NAV.map((g, gi) => (
            <div key={g.title} className={cn(gi > 0 && 'mt-5')}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{g.title}</div>
              {g.items.map(([label, Icon]) => {
                const active = label === 'Přehled'
                return (
                  <div key={label} className="flex items-center gap-3 px-3 rounded-xl text-sm font-medium" style={{ height: 42, color: active ? '#15803d' : '#6b7280', background: active ? '#dcfce7' : 'transparent' }}>
                    <Icon className="h-4 w-4" /> {label}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
