import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { FileText, Zap, Shield, Globe } from 'lucide-react'

export default async function HomePage() {
  const { userId } = await auth()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">Fakturo</span>
          <div className="flex gap-3">
            {userId ? (
              <Link href="/dashboard" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-4 py-2 rounded-lg transition">
                  Přihlásit se
                </Link>
                <Link href="/sign-up" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Začít zdarma
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Zap className="h-3.5 w-3.5" />
          Jednoduché faktury za pár sekund
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight max-w-3xl">
          Fakturace,{' '}
          <span className="text-indigo-600">která nezabírá čas</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
          Vytvářejte profesionální faktury v češtině, exportujte PDF a sledujte platby. Pro freelancery a malé firmy.
        </p>
        <div className="mt-10 flex gap-4 flex-wrap justify-center">
          <Link href="/sign-up" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium text-lg hover:bg-indigo-700 transition">
            Začít zdarma →
          </Link>
          <Link href="/sign-in" className="border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-8 py-3 rounded-xl font-medium text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
            Přihlásit se
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-400">Zdarma 3 faktury/měsíc · Pro neomezeně za 5 $/měs.</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          { icon: FileText, title: 'Profesionální PDF', desc: 'Čistý design, správná čeština, IČO, DIČ, DPH – vše na místě.' },
          { icon: Shield, title: 'Bezpečné uložení', desc: 'Faktury uloženy v Supabase. Přístupné kdykoliv, odkudkoliv.' },
          { icon: Globe, title: 'CZK + EUR + USD', desc: 'Fakturujte v korunách i zahraniční měně. DPH 0 %, 15 %, 21 %.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Icon className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-12">Ceny</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-left">
              <div className="text-lg font-bold mb-1">Zdarma</div>
              <div className="text-3xl font-bold mb-4">0 Kč<span className="text-base font-normal text-zinc-400">/měs.</span></div>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>✓ 3 faktury za měsíc</li>
                <li>✓ PDF export</li>
                <li>✓ CZK / EUR / USD</li>
              </ul>
            </div>
            <div className="p-8 rounded-xl border-2 border-indigo-500 text-left relative">
              <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">DOPORUČENO</div>
              <div className="text-lg font-bold mb-1">Pro</div>
              <div className="text-3xl font-bold mb-4">~120 Kč<span className="text-base font-normal text-zinc-400">/měs.</span></div>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>✓ Neomezený počet faktur</li>
                <li>✓ Vše ze Zdarma plánu</li>
                <li>✓ Prioritní podpora</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-400">
        © {new Date().getFullYear()} Fakturo
      </footer>
    </div>
  )
}
