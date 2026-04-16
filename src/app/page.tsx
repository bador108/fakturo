import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  Zap, Shield, Globe,
  TrendingUp, Sparkles,
} from 'lucide-react'
import { FeatureShowcase } from '@/components/FeatureShowcase'
import { ScreenshotZoom } from '@/components/ScreenshotZoom'
import { PricingSection } from '@/components/PricingSection'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ home?: string }> }) {
  const { userId } = await auth()
  const { home } = await searchParams
  if (userId && !home) redirect('/dashboard')

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Image src="/logo.svg" alt="Fakturo" width={130} height={32} priority />
          <div className="flex gap-3 items-center">
            {userId ? (
              <Link href="/dashboard" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg transition">
                  Přihlásit se
                </Link>
                <Link href="/sign-up" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                  Začít zdarma
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            Jednoduché faktury za pár sekund
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Fakturace,{' '}
            <span className="text-indigo-600">která nezabírá čas</span>
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            Vytvářejte profesionální faktury, sledujte výdaje, spravujte klienty a mějte přehled o cashflow. Vše na jednom místě.
          </p>
          <div className="mt-8 flex gap-4 flex-wrap">
            {userId ? (
              <Link href="/dashboard" className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-medium text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                Přejít do dashboardu →
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-medium text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                  Začít zdarma →
                </Link>
                <Link href="/sign-in" className="border border-slate-200 bg-white text-slate-600 px-7 py-3 rounded-xl font-medium text-base hover:bg-slate-50 transition">
                  Přihlásit se
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-400">Zdarma 15 faktur měsíčně · neomezené faktury od 99 Kč/měs.</p>
        </div>

        {/* Hero screenshot — clickable */}
        <ScreenshotZoom src="/screenshots/dashboard.png" alt="Fakturo dashboard" aspectRatio="1200/836" />
      </section>

      {/* Social proof */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Používají freelanceři a firmy po celé ČR</p>
          <div className="flex flex-wrap justify-center gap-10">
            {['Grafici', 'Programátoři', 'Fotografové', 'Konzultanti', 'E-shopy', 'Řemeslníci'].map(r => (
              <span key={r} className="text-slate-400 font-medium text-sm">{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature showcase with real screenshots */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Ukázka aplikace
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Vše co potřebujete</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Fakturo není jen fakturace — je to kompletní finanční nástroj pro freelancery a malé firmy.
          </p>
        </div>
        <FeatureShowcase />
      </section>

      {/* Key benefits strip */}
      <section className="bg-white border-y border-slate-100 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Globe, color: 'bg-indigo-50', iconColor: 'text-indigo-600', title: 'CZK · EUR · USD', desc: 'Fakturujte v libovolné měně s live kurzy ČNB.' },
              { icon: Shield, color: 'bg-emerald-50', iconColor: 'text-emerald-600', title: 'Bezpečné uložení', desc: 'Data v cloudu, přístupná odkudkoliv.' },
              { icon: TrendingUp, color: 'bg-amber-50', iconColor: 'text-amber-600', title: 'DPH 0·15·21 %', desc: 'Automatický výpočet a přehled DPH k odvodu.' },
              { icon: Zap, color: 'bg-violet-50', iconColor: 'text-violet-600', title: 'Rychlá registrace', desc: 'Méně než minuta, bez karty.' },
            ].map(({ icon: Icon, color, iconColor, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
                <div className={`h-11 w-11 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">Jak to funguje?</h2>
          <p className="mt-3 text-slate-400">Faktura hotová za 3 kroky</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Vyplň fakturu',
              desc: 'Zadej údaje dodavatele, odběratele a položky. IČO, DIČ, DPH – vše na jednom místě. ARES doplní údaje za tebe.',
              img: '/screenshots/new-invoice.png',
            },
            {
              step: '02',
              title: 'Pošli klientovi',
              desc: 'Stáhni profesionální PDF nebo pošli fakturu přímo emailem — jedním kliknutím. Volitelně včetně platebního odkazu.',
              img: '/screenshots/invoices.png',
            },
            {
              step: '03',
              title: 'Sleduj finance',
              desc: 'Označuj faktury jako zaplacené. Grafy cashflow, přehled DPH a automatické upomínky po splatnosti.',
              img: '/screenshots/finance.png',
            },
          ].map(({ step, title, desc, img }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className="w-full mb-6">
                <ScreenshotZoom src={img} alt={title} step={step} />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg mb-2">{title}</h3>
              <p className="text-sm text-slate-400 max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />

      {/* CTA */}
      <section className="bg-indigo-600 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src="/icon.svg" alt="Fakturo" width={40} height={40} className="rounded-xl" unoptimized />
            <span className="text-2xl font-bold text-white tracking-tight">Fakturo</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Připraveni začít fakturovat?</h2>
          <p className="text-indigo-200 mb-8">Registrace zabere méně než minutu. Kreditní karta není potřeba.</p>
          <Link href="/sign-up" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-50 transition inline-block">
            Začít zdarma →
          </Link>
        </div>
      </section>

      <Script src="https://botcraft.vercel.app/widget.js" data-bot-id="6523f5b5-fa53-4d8a-b0d2-214c90693499" strategy="lazyOnload" />

      <footer className="bg-white border-t border-slate-100 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Image src="/icon.svg" alt="Fakturo" width={24} height={24} className="rounded-md opacity-60" unoptimized />
          <span className="text-sm font-semibold text-slate-400">Fakturo</span>
        </div>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} Fakturo · Fakturace pro freelancery</p>
      </footer>
    </div>
  )
}
