'use client'

import { UserButton, useUser } from '@clerk/nextjs'

export function TopbarAccount({ planLabel }: { planLabel: string }) {
  const { user } = useUser()

  return (
    <div className="flex items-center gap-2.5">
      <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
      <div className="hidden sm:block leading-tight">
        <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
          {user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? 'Účet'}
        </p>
        <p className="text-xs text-slate-400">{planLabel}</p>
      </div>
    </div>
  )
}
