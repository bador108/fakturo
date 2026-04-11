'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, FileText, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Přehled', icon: LayoutDashboard },
  { href: '/invoices/new', label: 'Nová faktura', icon: Plus },
  { href: '/dashboard', label: 'Faktury', icon: FileText },
  { href: '/settings', label: 'Nastavení', icon: Settings },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 hidden md:flex flex-col bg-white border-r border-slate-100 px-4 py-6 gap-2 shadow-sm">
      {/* Logo */}
      <div className="px-3 mb-8">
        <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition tracking-tight">
          Fakturo
        </Link>
        <p className="text-xs text-slate-400 mt-0.5">Fakturační systém</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              path === href
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', path === href ? 'text-indigo-600' : 'text-slate-400')} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 pt-4 mt-2 flex items-center gap-3 px-3">
        <UserButton />
        <span className="text-sm text-slate-500 truncate">Účet</span>
      </div>
    </aside>
  )
}
