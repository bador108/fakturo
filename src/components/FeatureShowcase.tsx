'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LayoutDashboard, FileText, BarChart2, Users, Receipt, RefreshCw, Settings, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Přehled na první pohled',
    desc: 'Cashflow za posledních 6 měsíců, rychlý přehled příjmů a posledních faktur — vše hned po přihlášení.',
    img: '/screenshots/dashboard.png',
    color: 'indigo',
  },
  {
    id: 'invoices',
    icon: FileText,
    title: 'Správa faktur',
    desc: 'Všechny faktury na jednom místě. Filtrujte podle stavu: zaplaceno, odesláno, po splatnosti nebo nabídky.',
    img: '/screenshots/invoices.png',
    color: 'violet',
  },
  {
    id: 'finance',
    icon: BarChart2,
    title: 'Finanční přehledy',
    desc: 'Grafy příjmů vs. výdajů, přehled DPH po měsících a výdaje rozdělené podle kategorií. Export do Pohody jedním klikem.',
    img: '/screenshots/finance.png',
    color: 'sky',
  },
  {
    id: 'clients',
    icon: Users,
    title: 'Klienti',
    desc: 'Evidence klientů s historií faktur a celkovými obraty. Při tvorbě faktury doplní údaje automaticky z ARESu.',
    img: '/screenshots/clients.png',
    color: 'emerald',
  },
  {
    id: 'expenses',
    icon: Receipt,
    title: 'Evidence výdajů',
    desc: 'Zadejte výdaje podle kategorie — software, hardware, cestovné, marketing. Mějte přehled o tom, co vás stojí podnikání.',
    img: '/screenshots/expenses.png',
    color: 'amber',
  },
  {
    id: 'recurring',
    icon: RefreshCw,
    title: 'Opakující se faktury',
    desc: 'Nastavte šablony pro měsíční, čtvrtletní nebo roční fakturace. Systém vás upozorní, kdy je čas odeslat.',
    img: '/screenshots/recurring.png',
    color: 'rose',
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Nastavení & profily',
    desc: 'Spravujte profily dodavatele pro různé firmy, šablony položek pro rychlé vyplnění a automatické upomínky klientům.',
    img: '/screenshots/settings.png',
    color: 'slate',
  },
]

const colorMap: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-200', dot: 'bg-indigo-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-200', dot: 'bg-violet-500' },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-600',    ring: 'ring-sky-200',    dot: 'bg-sky-500'    },
  emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',ring: 'ring-emerald-200',dot: 'bg-emerald-500'},
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-200',  dot: 'bg-amber-500'  },
  rose:   { bg: 'bg-rose-50',   text: 'text-rose-600',   ring: 'ring-rose-200',   dot: 'bg-rose-500'   },
  slate:  { bg: 'bg-slate-50',  text: 'text-slate-600',  ring: 'ring-slate-200',  dot: 'bg-slate-400'  },
}

function Lightbox({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Browser chrome */}
        <div className="bg-slate-800 flex items-center gap-2 px-4 py-2.5">
          <button
            onClick={onClose}
            className="h-3 w-3 rounded-full bg-red-400 hover:bg-red-500 transition flex items-center justify-center"
          />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 bg-slate-700 rounded-md h-5 flex items-center px-3">
            <span className="text-[10px] text-slate-400 font-mono">fakturo.vercel.app</span>
          </div>
          <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative w-full" style={{ aspectRatio: '1200/836' }}>
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export function FeatureShowcase() {
  const [active, setActive] = useState('dashboard')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const current = features.find(f => f.id === active) ?? features[0]
  const c = colorMap[current.color]

  return (
    <>
      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Tab list */}
        <div className="space-y-1">
          {features.map(f => {
            const isActive = f.id === active
            const fc = colorMap[f.color]
            const Icon = f.icon
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all',
                  isActive
                    ? `${fc.bg} ring-1 ${fc.ring}`
                    : 'hover:bg-slate-50 text-slate-500',
                )}
              >
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', isActive ? fc.bg : 'bg-slate-100')}>
                  <Icon className={cn('h-4 w-4', isActive ? fc.text : 'text-slate-400')} />
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold leading-tight', isActive ? 'text-slate-900' : 'text-slate-600')}>{f.title}</p>
                  {isActive && (
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                  )}
                </div>
                {isActive && <span className={cn('h-2 w-2 rounded-full shrink-0 ml-auto', fc.dot)} />}
              </button>
            )
          })}
        </div>

        {/* Screenshot panel — click to zoom */}
        <button
          type="button"
          onClick={() => setLightbox(current.img)}
          className={cn(
            'relative rounded-2xl overflow-hidden border shadow-2xl ring-2 transition-all group w-full text-left cursor-zoom-in',
            c.ring,
          )}
        >
          {/* Browser chrome */}
          <div className="bg-slate-800 flex items-center gap-2 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <div className="ml-3 flex-1 bg-slate-700 rounded-md h-5 flex items-center px-3">
              <span className="text-[10px] text-slate-400 font-mono">fakturo.vercel.app</span>
            </div>
            <div className="ml-2 flex items-center gap-1 text-slate-400 text-[10px] opacity-0 group-hover:opacity-100 transition">
              <ZoomIn className="h-3 w-3" />
              <span>Zvětšit</span>
            </div>
          </div>
          <div className="relative w-full" style={{ aspectRatio: '1200/836' }}>
            <Image
              key={current.img}
              src={current.img}
              alt={current.title}
              fill
              className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
            {/* Zoom hint overlay */}
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-200 flex items-end justify-end p-4">
              <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5">
                <ZoomIn className="h-3 w-3" />
                Klikni pro zvětšení
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          src={lightbox}
          title={current.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
