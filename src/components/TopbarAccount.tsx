'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Settings } from 'lucide-react'

export function TopbarAccount({ planLabel }: { planLabel: string }) {
  const { user } = useUser()

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/settings"
        title="Nastavení"
        className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition shrink-0"
      >
        <Settings className="h-4 w-4" />
      </Link>
      <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
        <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
            {user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? 'Účet'}
          </p>
          <p className="text-xs text-slate-400">{planLabel}</p>
        </div>
      </div>
    </div>
  )
}
