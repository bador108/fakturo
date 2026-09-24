import Image from 'next/image'
import { Plus, LayoutDashboard, FileText, Users, Receipt, Calculator, RefreshCw, Settings, Bell, LogOut, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

// Desktopové rozvržení appky podle Sidebar.tsx + (dashboard)/layout.tsx
const SURFACE = '#fffcf6'
const BORDER = 'rgba(220,215,200,0.7)'
export const APP = { w: 1120, h: 700, bar: 40 }

export function BrowserBar({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-4 px-4 bg-[#f3f3f1] border-b border-slate-200/80" style={{ height: APP.bar }}>
      <span className="flex gap-2">
        <i className="h-3 w-3 rounded-full bg-[#ff5f57]" /><i className="h-3 w-3 rounded-full bg-[#febc2e]" /><i className="h-3 w-3 rounded-full bg-[#28c840]" />
      </span>
      <span className="mx-auto flex items-center gap-1.5 h-7 w-[420px] justify-center rounded-lg bg-white border border-slate-200/80 text-[13px] text-slate-500">
        <Lock className="h-3 w-3 text-slate-400" />fakturo.online/<span className="text-slate-800">{path}</span>
      </span>
      <span className="w-[52px]" />
    </div>
  )
}

const NAV = [
  { title: 'Hlavní', items: [['dashboard', 'Přehled', LayoutDashboard], ['invoices', 'Faktury', FileText], ['clients', 'Klienti', Users], ['expenses', 'Výdaje', Receipt]] },
  { title: 'Nástroje', items: [['dane', 'Odhad daní', Calculator], ['recurring', 'Opakující se', RefreshCw]] },
  { title: 'Systém', items: [['settings', 'Nastavení', Settings]] },
] as const

export function DesktopSidebar({ active, hover }: { active: string; hover?: string | null }) {
  return (
    <aside className="w-[232px] shrink-0 flex flex-col px-3 pt-5 pb-4" style={{ background: SURFACE, borderRight: `1px solid ${BORDER}` }}>
      <div className="px-3 h-8 flex items-center"><Image src="/logo.png" alt="" width={118} height={24} /></div>
      <div
        className="mt-5 mx-1 flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white"
        style={{ height: 40, background: '#15803d', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 20px rgba(21,128,61,0.25)' }}
      >
        <Plus className="h-4 w-4" /> Nová faktura
      </div>
      <nav className="mt-6 flex-1">
        {NAV.map((g, gi) => (
          <div key={g.title} className={cn(gi > 0 && 'mt-4')}>
            <div className="px-3 mb-1.5 h-5 leading-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{g.title}</div>
            <div className="space-y-0.5">
              {g.items.map(([id, label, Icon]) => {
                const on = id === active
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 px-3 h-9 rounded-xl text-sm font-medium transition-colors duration-150"
                    style={{ color: on ? '#15803d' : '#6b7280', background: on ? '#dcfce7' : hover === id ? '#f2f2ef' : 'transparent' }}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="pt-3 mx-1 space-y-2" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="px-2 text-xs text-slate-500">Pro plán</div>
        <div className="flex items-center gap-3 px-2 text-sm text-slate-500"><LogOut className="h-4 w-4" />Odhlásit se</div>
      </div>
    </aside>
  )
}

export function AccountBar() {
  return (
    <div className="flex justify-end items-center gap-4 mb-5">
      <span className="relative text-slate-400"><Bell className="h-5 w-5" /><i className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-[9px] font-semibold text-white not-italic flex items-center justify-center">1</i></span>
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700" />
        <div className="leading-tight"><p className="text-sm font-semibold text-slate-800">Jana</p><p className="text-xs text-slate-400">Pro plán</p></div>
      </div>
    </div>
  )
}
