'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { LayoutDashboard, FileText, Plus, Settings, Users, RefreshCw, Receipt, Menu, X, LogOut, Mail, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

// Stejné tokeny jako plovoucí pilulka na marketingu (SiteNav) — sidebar je
// druhé "chrome" místo appky, má vypadat jako ze stejné rodiny, ne jako
// samostatný admin šedý panel.
const C = {
  surface: '#fffcf6',
  pill: '#f2f2ef',
  ink: '#0c0c0e',
  muted: '#6b7280',
  primary: '#15803d',
  primarySoft: '#dcfce7',
  border: 'rgba(220,215,200,0.7)',
}

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard }
type Group = { title: string; items: NavItem[] }

const groups: Group[] = [
  {
    title: 'Hlavní',
    items: [
      { href: '/dashboard', label: 'Přehled', icon: LayoutDashboard },
      { href: '/invoices', label: 'Faktury', icon: FileText },
      { href: '/clients', label: 'Klienti', icon: Users },
      { href: '/expenses', label: 'Výdaje', icon: Receipt },
    ],
  },
  {
    title: 'Nástroje',
    items: [
      { href: '/dane', label: 'Odhad daní', icon: Calculator },
      { href: '/recurring', label: 'Opakující se', icon: RefreshCw },
    ],
  },
  {
    title: 'Systém',
    items: [
      { href: '/settings', label: 'Nastavení', icon: Settings },
    ],
  },
]

function NavLinks({ onNavigate, isOwner }: { onNavigate?: () => void; isOwner?: boolean }) {
  const path = usePathname()
  const isActive = (href: string) => (href === '/dashboard' ? path === href : path.startsWith(href))

  const withOwner: Group[] = isOwner
    ? groups.map(g => (g.title === 'Systém' ? { ...g, items: [...g.items, { href: '/zpravy', label: 'Zprávy', icon: Mail }] } : g))
    : groups

  return (
    <nav className="flex-1 overflow-y-auto">
      {withOwner.map((group, gi) => (
        <div key={group.title} className={cn(gi > 0 && 'mt-5')}>
          <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
            {group.title}
          </div>
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className="flex items-center gap-3 px-3 rounded-xl text-sm font-medium transition-colors duration-150"
                  style={{
                    height: 42,
                    color: active ? C.primary : C.muted,
                    background: active ? C.primarySoft : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.pill }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: active ? C.primary : C.muted }} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function SidebarFooter({ planLabel }: { planLabel?: string }) {
  const { signOut } = useClerk()
  return (
    <div className="pt-3 mt-3" style={{ borderTop: `1px solid ${C.border}` }}>
      {planLabel && (
        <div className="px-3 mb-1 text-xs font-medium" style={{ color: C.muted }}>{planLabel}</div>
      )}
      <button
        onClick={() => signOut({ redirectUrl: '/sign-in' })}
        className="flex items-center gap-3 w-full px-3 rounded-xl text-sm font-medium transition-colors duration-150"
        style={{ height: 40, color: C.muted }}
        onMouseEnter={e => { e.currentTarget.style.background = C.pill }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Odhlásit se
      </button>
    </div>
  )
}

function SidebarLogo() {
  return (
    <Link href="/" className="flex items-center transition-opacity duration-150 hover:opacity-80">
      <Image src="/logo.png" alt="Fakturo" width={134} height={27} />
    </Link>
  )
}

function NewInvoiceCta({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/invoices/new"
      onClick={onNavigate}
      className="flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5"
      style={{ height: 44, background: C.primary, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 20px rgba(21,128,61,0.25)' }}
    >
      <Plus className="h-4 w-4" />
      Nová faktura
    </Link>
  )
}

export function Sidebar({ isOwner, planLabel }: { isOwner?: boolean; planLabel?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar — fixní levý sloupec, celá výška */}
      <aside
        className="w-64 hidden md:flex flex-col px-4 py-6 gap-5 shrink-0"
        style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}
      >
        <div className="px-3"><SidebarLogo /></div>
        <div className="px-1"><NewInvoiceCta /></div>
        <NavLinks isOwner={isOwner} />
        <SidebarFooter planLabel={planLabel} />
      </aside>

      {/* Mobile top bar — jen logo + hamburger, zvonek je teď v topbaru obsahu */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4"
        style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
      >
        <SidebarLogo />
        <button
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-label="Otevřít menu"
          className="h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-150"
          style={{ color: C.ink }}
          onMouseEnter={e => { e.currentTarget.style.background = C.pill }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-150"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative w-[80vw] max-w-[18rem] flex flex-col px-4 py-6 gap-5 shadow-2xl h-full"
            style={{ background: C.surface }}
          >
            <div className="px-3 flex items-center justify-between">
              <SidebarLogo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Zavřít menu"
                className="h-9 w-9 flex items-center justify-center rounded-full transition-colors duration-150"
                style={{ color: C.muted }}
                onMouseEnter={e => { e.currentTarget.style.background = C.pill }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="px-1"><NewInvoiceCta onNavigate={() => setMobileOpen(false)} /></div>
            <NavLinks onNavigate={() => setMobileOpen(false)} isOwner={isOwner} />
            <SidebarFooter planLabel={planLabel} />
          </aside>
        </div>
      )}
    </>
  )
}
