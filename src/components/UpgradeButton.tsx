'use client'

import { useState } from 'react'
import { CheckCircle2, X, Zap, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'start',
    name: 'Start',
    monthly: 99,
    annual: 79,
    color: 'indigo',
    features: ['Neomezené faktury', 'Evidence výdajů', 'Cashflow přehled', 'CZK / EUR / USD'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 249,
    annual: 199,
    color: 'violet',
    features: ['Vše ze Start', 'Opakující se faktury', 'Automatické upomínky', 'Finanční grafy', 'Export Pohoda XML', 'Online platební odkaz'],
  },
] as const

export function UpgradeButton() {
  const [open, setOpen] = useState(false)
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual')
  const [selected, setSelected] = useState<'start' | 'pro'>('start')

  function go() {
    window.location.href = `/checkout?plan=${selected}&billing=${billing}`
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-1.5"
      >
        <Zap className="h-3.5 w-3.5" />
        Upgradovat
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Vybrat předplatné</h2>
                <p className="text-sm text-slate-400">Zvolte plán a způsob platby</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Billing toggle */}
            <div className="flex gap-2 mb-5 bg-slate-100 rounded-xl p-1">
              {(['monthly', 'annual'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    'flex-1 text-sm font-medium py-2 rounded-lg transition-all',
                    billing === b ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
                  )}
                >
                  {b === 'monthly' ? 'Měsíčně' : (
                    <span className="flex items-center justify-center gap-1.5">
                      Ročně
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">−20 %</span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {PLANS.map(plan => {
                const price = billing === 'annual' ? plan.annual : plan.monthly
                const isSelected = selected === plan.id
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelected(plan.id)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all',
                      isSelected
                        ? plan.color === 'indigo'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        'text-xs font-bold uppercase tracking-wide',
                        isSelected
                          ? plan.color === 'indigo' ? 'text-indigo-600' : 'text-violet-600'
                          : 'text-slate-500',
                      )}>
                        {plan.name}
                      </span>
                      {isSelected && (
                        <span className={cn(
                          'h-4 w-4 rounded-full flex items-center justify-center',
                          plan.color === 'indigo' ? 'bg-indigo-500' : 'bg-violet-500',
                        )}>
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-end gap-0.5">
                      <span className="text-2xl font-bold text-slate-900">{price}</span>
                      <span className="text-sm text-slate-400 mb-0.5"> Kč/měs.</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-[10px] text-slate-400 mt-1">{price * 12} Kč/rok</p>
                    )}
                    <ul className="mt-3 space-y-1">
                      {plan.features.slice(0, 3).map(f => (
                        <li key={f} className="text-[11px] text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className={cn('h-3 w-3 shrink-0', plan.color === 'indigo' ? 'text-indigo-400' : 'text-violet-400')} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>

            {/* Summary + CTA */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Fakturo {selected === 'start' ? 'Start' : 'Pro'} · {billing === 'annual' ? 'ročně' : 'měsíčně'}</span>
                <span className="font-semibold text-slate-900">
                  {billing === 'annual'
                    ? `${selected === 'start' ? 79 : 199} Kč/měs.`
                    : `${selected === 'start' ? 99 : 249} Kč/měs.`}
                </span>
              </div>
              {billing === 'annual' && (
                <p className="text-xs text-emerald-600 mt-1">
                  Fakturováno {selected === 'start' ? 79 * 12 : 199 * 12} Kč ročně · ušetříš {selected === 'start' ? (99 - 79) * 12 : (249 - 199) * 12} Kč
                </p>
              )}
            </div>

            <button
              onClick={go}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition',
                selected === 'start'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-violet-600 hover:bg-violet-700',
              )}
            >
              Pokračovat k platbě <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
