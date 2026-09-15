import Link from 'next/link'
import { Crown } from 'lucide-react'

interface Props {
  title: string
  description: string
}

// Zámek na Pro funkce — konzistentní vzhled napříč appkou (Nastavení, /recurring, atd).
export function ProUpsell({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 bg-violet-50/50 rounded-xl border border-violet-100">
      <div className="h-10 w-10 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
        <Crown className="h-5 w-5 text-violet-600" />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
      <Link
        href="/cenik"
        className="mt-4 inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
      >
        Upgradovat na Pro
      </Link>
    </div>
  )
}
