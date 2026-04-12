'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const freeFeatures = [
  '3 faktury za měsíc',
  'PDF export a odeslání emailem',
  'Správa klientů',
  'Evidence výdajů',
  'Cashflow přehled',
  'CZK / EUR / USD (live kurzy ČNB)',
  'Doplnění z ARESu',
]

const proFeatures = [
  'Neomezené faktury',
  'PDF export a odeslání emailem',
  'Správa klientů',
  'Evidence výdajů',
  'Opakující se faktury',
  'Automatické upomínky klientům',
  'Finanční grafy a přehledy',
  'Export Pohoda XML',
  'Online platební odkaz (Stripe)',
  'CZK / EUR / USD (live kurzy ČNB)',
  'Doplnění z ARESu',
  'Šablony položek',
  'Více profilů dodavatele',
  'Prioritní podpora',
]

export function PricingSection() {
  const [annual, setAnnual] = useState(true)

  const monthlyPrice = annual ? 149 : 199
  const annualTotal = 149 * 12 // 1788

  return (
    <section className="bg-white border-y border-slate-100 py-20" id="pricing">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Jednoduché ceny</h2>
          <p className="text-slate-400 mb-7">Začni zdarma, upgraduj až budeš potřebovat</p>

          {/* Annual/monthly toggle */}
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'text-sm font-medium px-4 py-1.5 rounded-full transition-all',
                !annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Měsíčně
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'text-sm font-medium px-4 py-1.5 rounded-full transition-all flex items-center gap-2',
                annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Ročně
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                −25 %
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Zdarma</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-bold text-slate-900">0</span>
                <span className="text-2xl font-bold text-slate-900 mb-1">Kč</span>
                <span className="text-slate-400 mb-1.5">/měs.</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Pro první kroky a testování</p>
              <ul className="space-y-2.5 text-sm text-slate-500 mb-8">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/sign-up"
              className="mt-auto block text-center border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              Začít zdarma
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-2xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-50 to-white relative flex flex-col shadow-lg shadow-indigo-100">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
              <Zap className="h-3 w-3" />
              NEJOBLÍBENĚJŠÍ
            </div>

            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-bold text-slate-900">{monthlyPrice}</span>
                <span className="text-2xl font-bold text-slate-900 mb-1">Kč</span>
                <span className="text-slate-400 mb-1.5">/měs.</span>
              </div>
              {annual ? (
                <p className="text-sm text-slate-400 mb-6">
                  Fakturováno ročně · <span className="font-medium text-slate-600">{annualTotal.toLocaleString('cs-CZ')} Kč/rok</span>
                  <span className="ml-2 text-emerald-600 font-medium">ušetříš 600 Kč</span>
                </p>
              ) : (
                <p className="text-sm text-slate-400 mb-6">
                  Fakturováno měsíčně · ročně jen{' '}
                  <button onClick={() => setAnnual(true)} className="text-indigo-600 font-medium hover:underline">
                    149 Kč/měs.
                  </button>
                </p>
              )}
              <ul className="space-y-2.5 text-sm text-slate-500 mb-8">
                {proFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/sign-up"
              className="mt-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Vyzkoušet Pro <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Competitor comparison */}
        <div className="mt-10 max-w-3xl mx-auto">
          <p className="text-center text-xs text-slate-400 mb-4 uppercase tracking-widest">Srovnání s konkurencí</p>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {[
              { name: 'Fakturo Pro', price: '199 Kč', color: 'text-indigo-600 font-bold', bg: 'bg-indigo-50 border-indigo-100' },
              { name: 'Fakturoid', price: 'od 182 Kč', color: 'text-slate-500', bg: 'bg-white border-slate-100' },
              { name: 'iDoklad', price: 'od 240 Kč', color: 'text-slate-500', bg: 'bg-white border-slate-100' },
            ].map(c => (
              <div key={c.name} className={cn('rounded-xl border p-3', c.bg)}>
                <p className="text-xs text-slate-400 mb-1">{c.name}</p>
                <p className={cn('text-base', c.color)}>{c.price}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">/měs.</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            * Ceny konkurence jsou za měsíční platbu. Roční plán Fakturo Pro vychází na <strong className="text-slate-600">149 Kč/měs.</strong>
          </p>
        </div>
      </div>
    </section>
  )
}
