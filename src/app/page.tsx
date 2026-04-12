import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { auth } from '@clerk/nextjs/server'
import {
  FileText, Zap, Shield, Globe, CheckCircle2, Users, Receipt,
  RefreshCw, BarChart2, TrendingUp, Send, ArrowRight
} from 'lucide-react'

export default async function HomePage() {
  const { userId } = await auth()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
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
            <Link href="/sign-up" className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-medium text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Začít zdarma →
            </Link>
            <Link href="/sign-in" className="border border-slate-200 bg-white text-slate-600 px-7 py-3 rounded-xl font-medium text-base hover:bg-slate-50 transition">
              Přihlásit se
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">Zdarma 30 faktur/měsíc · Pro neomezeně za 500 Kč/měs.</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl h-80 md:h-96">
          <Image
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
            alt="Člověk pracující na faktuře"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Faktura #20260042</p>
                <p className="text-xs text-slate-400">Novák s.r.o · 12 500 Kč</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">Zaplaceno</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Používají freelanceři a firmy po celé ČR</p>
          <div className="flex flex-wrap justify-center gap-10">
            {['Grafici', 'Programátoři', 'Fotografové', 'Konzultanti', 'E-shopy', 'Řemeslníci'].map(r => (
              <span key={r} className="text-slate-400 font-medium text-sm">{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">Vše co potřebujete</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">Fakturo není jen fakturace — je to kompletní finanční nástroj pro freelancery a malé firmy.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              color: 'bg-indigo-50',
              iconColor: 'text-indigo-600',
              title: 'Profesionální faktury',
              desc: 'Vytvořte fakturu za pár kliknutí. IČO, DIČ, DPH, QR platba — vše na jednom místě. PDF připraveno k odeslání.',
              img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80',
            },
            {
              icon: Send,
              color: 'bg-violet-50',
              iconColor: 'text-violet-600',
              title: 'Odeslání emailem',
              desc: 'Pošlete fakturu přímo z aplikace. Klient dostane PDF přílohu — bez Outlooku, bez kopírování.',
              img: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&q=80',
            },
            {
              icon: Users,
              color: 'bg-sky-50',
              iconColor: 'text-sky-600',
              title: 'Správa klientů',
              desc: 'Evidujte klienty a jejich kontaktní údaje. Při tvorbě faktury je vyberte jedním kliknutím.',
              img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80',
            },
            {
              icon: Receipt,
              color: 'bg-amber-50',
              iconColor: 'text-amber-600',
              title: 'Evidence výdajů',
              desc: 'Sledujte výdaje a mějte přehled o tom, kolik utráíte. Jednoduše, bez komplikovaného účetnictví.',
              img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
            },
            {
              icon: RefreshCw,
              color: 'bg-emerald-50',
              iconColor: 'text-emerald-600',
              title: 'Opakující se faktury',
              desc: 'Nastavte šablony pro pravidelné fakturace. Ušetřete čas na rutinních úkolech každý měsíc.',
              img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
            },
            {
              icon: BarChart2,
              color: 'bg-rose-50',
              iconColor: 'text-rose-600',
              title: 'Cashflow přehled',
              desc: 'Graf příjmů za posledních 6 měsíců. Vždy víte, jak na tom jste — a kam se váš byznys ubírá.',
              img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
            },
          ].map(({ icon: Icon, color, iconColor, title, desc, img }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
              <div className="relative h-44 overflow-hidden">
                <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                <div className={`absolute top-3 left-3 h-9 w-9 ${color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Jak to funguje?</h2>
            <p className="mt-3 text-slate-400">Faktura hotová za 3 kroky</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Vyplň fakturu', desc: 'Zadej údaje dodavatele, odběratele a položky. IČO, DIČ, DPH – vše na jednom místě.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80' },
              { step: '02', title: 'Stáhni nebo pošli PDF', desc: 'Stáhni profesionální PDF nebo pošli fakturu přímo emailem klientovi — jedním kliknutím.', img: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&q=80' },
              { step: '03', title: 'Sleduj platby', desc: 'Označuj faktury jako odeslané nebo zaplacené. Cashflow přehled vždy po ruce.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80' },
            ].map(({ step, title, desc, img }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-md mb-6 group">
                  <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{step}</div>
                </div>
                <h3 className="font-semibold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-sm text-slate-400 max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key benefits strip */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Globe, color: 'bg-indigo-50', iconColor: 'text-indigo-600', title: 'CZK · EUR · USD', desc: 'Fakturujte v libovolné měně.' },
            { icon: Shield, color: 'bg-emerald-50', iconColor: 'text-emerald-600', title: 'Bezpečné uložení', desc: 'Data v cloudu, přístupná odkudkoliv.' },
            { icon: TrendingUp, color: 'bg-amber-50', iconColor: 'text-amber-600', title: 'DPH 0·15·21 %', desc: 'Automatický výpočet DPH.' },
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
      </section>

      {/* Pricing */}
      <section className="bg-white border-y border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Jednoduché ceny</h2>
          <p className="text-slate-400 mb-12">Začni zdarma, upgraduj až budeš potřebovat</p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="text-lg font-bold mb-1 text-slate-900">Zdarma</div>
              <div className="text-4xl font-bold mb-2 text-slate-900">0 Kč<span className="text-lg font-normal text-slate-400">/měs.</span></div>
              <p className="text-sm text-slate-400 mb-6">Pro začínající freelancery</p>
              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  '30 faktur za měsíc',
                  'PDF export + odeslání emailem',
                  'Správa klientů',
                  'Evidence výdajů',
                  'Cashflow přehled',
                  'CZK / EUR / USD',
                  'Základní podpora',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="mt-8 block text-center border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl font-medium hover:bg-indigo-50 transition">
                Začít zdarma
              </Link>
            </div>
            {/* Pro */}
            <div className="p-8 rounded-2xl border-2 border-indigo-500 bg-indigo-50 relative">
              <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">NEJOBLÍBENĚJŠÍ</div>
              <div className="text-lg font-bold mb-1 text-slate-900">Pro</div>
              <div className="text-4xl font-bold mb-2 text-slate-900">500 Kč<span className="text-lg font-normal text-slate-400">/měs.</span></div>
              <p className="text-sm text-slate-400 mb-6">Pro aktivní freelancery a firmy</p>
              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  'Neomezené faktury',
                  'PDF export + odeslání emailem',
                  'Správa klientů',
                  'Evidence výdajů',
                  'Opakující se faktury',
                  'Cashflow přehled',
                  'CZK / EUR / USD',
                  'Prioritní podpora',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="mt-8 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                Vyzkoušet Pro <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
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

      <Script src="https://botcraft.vercel.app/widget.js" data-bot-id="8ff07e98-f810-45d1-8277-147771fb02dd" strategy="lazyOnload" />

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
