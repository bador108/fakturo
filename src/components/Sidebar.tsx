'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { LayoutDashboard, FileText, Plus, Settings, Users, RefreshCw, BarChart2, Receipt, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/NotificationBell'

const links = [
  { href: '/dashboard', label: 'Přehled', icon: LayoutDashboard },
  { href: '/invoices', label: 'Faktury', icon: FileText },
  { href: '/invoices/new', label: 'Nová faktura', icon: Plus },
  { href: '/clients', label: 'Klienti', icon: Users },
  { href: '/expenses', label: 'Výdaje', icon: Receipt },
  { href: '/recurring', label: 'Opakující se', icon: RefreshCw },
  { href: '/finance', label: 'Finance', icon: BarChart2 },
  { href: '/settings', label: 'Nastavení', icon: Settings },
]

export function Sidebar() {
  const path = usePathname()
  const { user } = useUser()

  const isActive = (href: string) =>
    href === '/dashboard' ? path === href : path.startsWith(href)

  return (
    <aside className="w-64 hidden md:flex flex-col bg-white border-r border-slate-100 px-4 py-6 gap-2 shadow-sm">
      {/* Logo */}
      <div className="px-3 mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition tracking-tight">
            Fakturo
          </Link>
          <p className="text-xs text-slate-400 mt-0.5">Fakturační systém</p>
        </div>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-indigo-600' : 'text-slate-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Feedback link */}
      <a
        href="mailto:napad@fakturo.cz?subject=Nápad na zlepšení Fakturo"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition mx-0"
      >
        <Lightbulb className="h-3.5 w-3.5 shrink-0" />
        Navrhnout zlepšení
      </a>

      {/* User */}
      <div className="border-t border-slate-100 pt-4 mt-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition">
          <UserButton />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? 'Účet'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
