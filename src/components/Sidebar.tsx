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
    <aside className="w-64 hidden md:flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 px-4 py-6 gap-2">
      <div className="px-2 mb-6">
        <span className="text-xl font-bold text-indigo-600">Fakturo</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              path === href
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 px-3 py-2">
        <UserButton />
        <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate">Účet</span>
      </div>
    </aside>
  )
}
