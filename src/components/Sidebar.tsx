'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser, useClerk } from '@clerk/nextjs'
import { LayoutDashboard, FileText, Plus, Settings, Users, RefreshCw, BarChart2, Receipt, Menu, X, LogOut } from 'lucide-react'
import Image from 'next/image'
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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname()
  const isActive = (href: string) =>
    href === '/dashboard' ? path === href : path.startsWith(href)

  return (
    <nav className="flex-1 space-y-0.5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              active ? 'bg-brand-soft text-brand' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand' : 'text-slate-400')} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function UserSection() {
  const { user } = useUser()
  const { signOut } = useClerk()
  return (
    <div className="border-t border-slate-100 pt-4 mt-1 space-y-1">
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
      <button
        onClick={() => signOut({ redirectUrl: '/sign-in' })}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Odhlásit se
      </button>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-white border-r border-slate-100 px-4 py-6 gap-2 shadow-sm shrink-0">
        <div className="px-3 mb-6 flex items-center justify-between">
          <Link href="/?home=1" className="hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Fakturo" width={100} height={27} />
          </Link>
          <NotificationBell />
        </div>
        <NavLinks />
        <UserSection />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-sm h-14 flex items-center justify-between px-4">
        <Link href="/?home=1" className="hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Fakturo" width={90} height={24} />
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-50 active:bg-slate-100 transition text-slate-600"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-[80vw] max-w-[18rem] bg-white flex flex-col px-4 py-6 gap-2 shadow-2xl h-full">
            <div className="px-3 mb-6 flex items-center justify-between">
              <div>
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <Image src="/logo.png" alt="Fakturo" width={100} height={27} />
                </Link>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <UserSection />
          </aside>
        </div>
      )}
    </>
  )
}
