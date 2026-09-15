import Link from 'next/link'
import { Crown } from 'lucide-react'

interface Props {
  title: string
  description: string
  minPlan?: 'start' | 'pro'
}

const STYLES = {
  start: { bg: 'bg-brand-soft/60', iconBg: 'bg-brand-soft', icon: 'text-brand', btn: 'bg-brand hover:bg-brand-dark', cta: 'Upgradovat na Start' },
  pro: { bg: 'bg-violet-50/50', iconBg: 'bg-violet-100', icon: 'text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700', cta: 'Upgradovat na Pro' },
}

// Zámek na placené funkce — konzistentní vzhled napříč appkou (Nastavení, /recurring,
// /expenses, dashboard, atd). minPlan řídí jen barvu a text tlačítka, odkaz je vždy na ceník.
export function ProUpsell({ title, description, minPlan = 'pro' }: Props) {
  const s = STYLES[minPlan]
  return (
    <div className={`flex flex-col items-center text-center py-10 px-6 ${s.bg} rounded-xl border border-slate-100`}>
      <div className={`h-10 w-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
        <Crown className={`h-5 w-5 ${s.icon}`} />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
      <Link
        href="/cenik"
        className={`mt-4 inline-flex items-center gap-1.5 ${s.btn} text-white text-xs font-medium px-4 py-2 rounded-lg transition`}
      >
        {s.cta}
      </Link>
    </div>
  )
}
