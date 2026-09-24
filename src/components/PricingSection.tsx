'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, Minus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  badge?: string
  badgeColor?: string
  monthly: number
  annual: number
  annualTotal: number
  subtitle: string
  description: string
  accentColor: string
  cardClass: string
  btnClass: string
  checkColor: string
  features: Array<{ text: string; included: boolean }>
}

type Tier = 'free' | 'start' | 'pro'
const RANK: Record<Tier, number> = { free: 0, start: 1, pro: 2 }

// Jeden seznam řádků pro všechny plány, ať jde ceník porovnat řádek po řádku. Musí sedět
// s tím, co appka opravdu hlídá v kódu (FREE_TIER_LIMIT, FREE_CLIENT_LIMIT, isPaid / isPro).
const FEATURES: { text: string; free?: string; from: Tier }[] = [
  { text: 'Neomezené faktury', free: '5 faktur měsíčně', from: 'free' },
  { text: 'Neomezení klienti', free: 'Až 5 klientů', from: 'free' },
  { text: 'PDF, odeslání e-mailem a QR platba', from: 'free' },
  { text: 'Odkaz na fakturu pro klienta', from: 'free' },
  { text: 'Doplnění firmy z ARESu', from: 'free' },
  { text: 'Párování plateb z výpisu banky', from: 'free' },
  { text: 'EUR a USD s kurzem ČNB', from: 'start' },
  { text: 'Cenové nabídky', from: 'start' },
  { text: 'Výdaje a účtenky', from: 'start' },
  { text: 'Cashflow, grafy a odhad daní', from: 'start' },
  { text: 'Vlastní barva faktury', from: 'start' },
  { text: 'Pravidelné faktury', from: 'pro' },
  { text: 'Automatické upomínky klientům', from: 'pro' },
  { text: 'Export do Pohody pro účetní', from: 'pro' },
  { text: 'Logo na faktuře', from: 'pro' },
  { text: 'Šablony položek a víc profilů dodavatele', from: 'pro' },
]

function featuresFor(tier: Tier) {
  return FEATURES.map(f => ({ text: tier === 'free' && f.free ? f.free : f.text, included: RANK[tier] >= RANK[f.from] }))
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Zdarma',
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    subtitle: 'Pro vyzkoušení bez závazků',
    description: '5 faktur měsíčně a až 5 klientů. Stačí na pár zakázek nebo na vyzkoušení, jestli ti Fakturo sedne. Žádný časový limit.',
    accentColor: 'text-slate-900',
    cardClass: 'border border-slate-200 bg-white shadow-sm',
    btnClass: 'border-2 border-slate-200 text-slate-700 hover:border-brand-soft hover:text-brand',
    checkColor: 'text-slate-400',
    features: featuresFor('free'),
  },
  {
    id: 'start',
    name: 'Start',
    badge: 'NEJOBLÍBENĚJŠÍ',
    badgeColor: 'bg-green-600',
    monthly: 99,
    annual: 79,
    annualTotal: 79 * 12,
    subtitle: 'Pro aktivní freelancery',
    description: 'Pro každýho, kdo fakturuje pravidelně. Neomezené faktury a klienti, cizí měny, cenové nabídky a výdaje s přehledem cashflow — víš přesně, na čem jsi.',
    accentColor: 'text-green-600',
    cardClass: 'border-2 border-green-500 bg-gradient-to-b from-green-50 to-white shadow-xl shadow-green-100',
    btnClass: 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200',
    checkColor: 'text-green-600',
    features: featuresFor('start'),
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'VŠE V JEDNOM',
    badgeColor: 'bg-yellow-500',
    monthly: 249,
    annual: 199,
    annualTotal: 199 * 12,
    subtitle: 'Pro profesionály a firmy',
    description: 'Fakturace na autopilota. Pravidelné faktury se vystaví samy, upomínky klientům odejdou samy a účetní dostane export do Pohody — appka pracuje, ty fakturuješ.',
    accentColor: 'text-yellow-600',
    cardClass: 'border-2 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white shadow-xl shadow-yellow-100',
    btnClass: 'bg-yellow-500 text-slate-900 hover:bg-yellow-400 shadow-lg shadow-yellow-200',
    checkColor: 'text-yellow-600',
    features: featuresFor('pro'),
  },
]

// anchorId: na hlavní stránce už má id="pricing" obalující sekce, takže se tady nesmí opakovat.
export function PricingSection({ anchorId = 'pricing' }: { anchorId?: string | null } = {}) {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  function handleUpgrade(plan: 'start' | 'pro') {
    const billing = annual ? 'annual' : 'monthly'
    setLoading(plan)
    // Always go through /checkout — it handles auth + Stripe redirect
    window.location.href = `/checkout?plan=${plan}&billing=${billing}`
  }

  return (
    <section className="bg-white border-y border-slate-100 py-20" id={anchorId ?? undefined}>
      <div className="max-w-6xl mx-auto px-6">

        {/* Toggle */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'text-sm font-medium px-5 py-1.5 rounded-full transition-all',
                !annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Měsíčně
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'text-sm font-medium px-5 py-1.5 rounded-full transition-all flex items-center gap-2',
                annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Ročně
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                ušetři až 20 %
              </span>
            </button>
          </div>
        </div>

        {/* 3 cards */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map(plan => {
            const price = annual ? plan.annual : plan.monthly
            const saving = plan.monthly > 0 ? (plan.monthly - plan.annual) * 12 : 0

            return (
              <div
                key={plan.id}
                className={cn('rounded-2xl p-7 flex flex-col relative', plan.cardClass)}
              >
                {plan.badge && (
                  <div className={cn(
                    'absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-4 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap',
                    plan.badgeColor,
                  )}>
                    <Zap className="h-2.5 w-2.5" />
                    {plan.badge}
                  </div>
                )}

                {/* Price */}
                <div className="mb-5">
                  <p className={cn('text-xs font-bold uppercase tracking-widest mb-3', plan.accentColor)}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-slate-900 tabular-nums">{price}</span>
                    <span className="text-lg font-bold text-slate-900 mb-0.5">Kč</span>
                    <span className="text-slate-400 mb-0.5 text-sm">/měs.</span>
                  </div>
                  {plan.id === 'free' ? (
                    <p className="text-sm text-slate-400 mt-1.5">Navždy zdarma</p>
                  ) : annual && saving > 0 ? (
                    <p className="text-sm text-slate-400 mt-1.5">
                      {(price * 12).toLocaleString('cs-CZ')} Kč/rok ·{' '}
                      <span className="text-emerald-600 font-medium">ušetříš {saving} Kč</span>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 mt-1.5">
                      {plan.subtitle}
                    </p>
                  )}
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-6">{plan.description}</p>

                {/* Features */}
                <ul className="space-y-2 text-sm mb-7 flex-1">
                  {plan.features.map(f => (
                    <li key={f.text} className={cn('flex items-center gap-2', f.included ? 'text-slate-600' : 'text-slate-300')}>
                      {f.included
                        ? <CheckCircle2 className={cn('h-4 w-4 shrink-0', plan.checkColor)} />
                        : <Minus className="h-4 w-4 shrink-0 text-slate-200" />
                      }
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.id === 'free' ? (
                  <Link
                    href="/sign-up"
                    className={cn('flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition text-sm', plan.btnClass)}
                  >
                    Začít zdarma
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id as 'start' | 'pro')}
                    disabled={loading === plan.id}
                    className={cn('flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition text-sm w-full disabled:opacity-70', plan.btnClass)}
                  >
                    {loading === plan.id
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Načítám...</>
                      : <>{`Vybrat ${plan.name}`} <ArrowRight className="h-4 w-4" /></>
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8 max-w-xl mx-auto leading-relaxed">
          Máš slevový kupon? Zadáš ho v platební bráně u měsíčního předplatného.
          Předplatné vypneš jedním přepínačem v Nastavení, doběhne do konce zaplaceného období.
        </p>

      </div>
    </section>
  )
}
