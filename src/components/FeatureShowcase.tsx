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
    desc: 'Cashflow za posledních 12 měsíců, rychlý přehled příjmů a posledních faktur — vše hned po přihlášení.',
    img: '/screenshots/dashboard.png', w: 1900, h: 911,
    color: 'indigo',
  },
  {
    id: 'invoices',
    icon: FileText,
    title: 'Správa faktur',
    desc: 'Všechny faktury na jednom místě. Filtrujte podle stavu: zaplaceno, odesláno, po splatnosti nebo nabídky.',
    img: '/screenshots/invoices.png', w: 1281, h: 906,
    color: 'violet',
  },
  {
    id: 'finance',
    icon: BarChart2,
    title: 'Finanční přehledy',
    desc: 'Grafy příjmů vs. výdajů, přehled DPH po měsících a výdaje rozdělené podle kategorií. Export do Pohody jedním klikem.',
    img: '/screenshots/finance.png', w: 1545, h: 693,
    color: 'sky',
  },
  {
    id: 'clients',
    icon: Users,
    title: 'Klienti',
    desc: 'Evidence klientů s historií faktur a celkovými obraty. Při tvorbě faktury doplní údaje automaticky z ARESu.',
    img: '/screenshots/clients.png', w: 1162, h: 716,
    color: 'emerald',
  },
  {
    id: 'expenses',
    icon: Receipt,
    title: 'Evidence výdajů',
    desc: 'Zadejte výdaje podle kategorie — software, hardware, cestovné, marketing. Mějte přehled o tom, co vás stojí podnikání.',
    img: '/screenshots/expenses.png', w: 992, h: 760,
    color: 'amber',
  },
  {
    id: 'recurring',
    icon: RefreshCw,
    title: 'Opakující se faktury',
    desc: 'Nastavte šablony pro měsíční, čtvrtletní nebo roční fakturace. Systém vás upozorní, kdy je čas odeslat.',
    img: '/screenshots/recurring.png', w: 1016, h: 757,
    color: 'rose',
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Nastavení & profily',
    desc: 'Spravujte profily dodavatele pro různé firmy, šablony položek pro rychlé vyplnění a automatické upomínky klientům.',
    img: '/screenshots/settings.png', w: 1200, h: 836,
    color: 'slate',
  },
]

// Design je černobílý — jeden neutrální styl pro všechny taby, žádné barvy per-feature.
const NEUTRAL = { rowBg: 'bg-slate-100', ring: 'ring-slate-300', iconBg: 'bg-slate-900', iconText: 'text-white', dot: 'bg-slate-900' }

function Lightbox({ src, w, h, title, onClose }: { src: string; w: number; h: number; title: string; onClose: () => void }) {
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
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-sm text-white flex items-center justify-center transition"
        >
          <X className="h-4 w-4" />
        </button>
        <Image
          src={src}
          alt={title}
          width={w}
          height={h}
          className="block w-full h-auto bg-white"
          sizes="(max-width: 1152px) 100vw, 1152px"
          quality={95}
          priority
        />
      </div>
    </div>
  )
}

export function FeatureShowcase() {
  const [active, setActive] = useState('dashboard')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const current = features.find(f => f.id === active) ?? features[0]

  return (
    <>
      <div className="grid md:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Tab list */}
        <div className="space-y-1">
          {features.map(f => {
            const isActive = f.id === active
            const Icon = f.icon
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all',
                  isActive
                    ? `${NEUTRAL.rowBg} ring-1 ${NEUTRAL.ring}`
                    : 'hover:bg-slate-50 text-slate-500',
                )}
              >
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', isActive ? NEUTRAL.iconBg : 'bg-slate-100')}>
                  <Icon className={cn('h-4 w-4', isActive ? NEUTRAL.iconText : 'text-slate-400')} />
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold leading-tight', isActive ? 'text-slate-900' : 'text-slate-600')}>{f.title}</p>
                  {isActive && (
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                  )}
                </div>
                {isActive && <span className={cn('h-2 w-2 rounded-full shrink-0 ml-auto', NEUTRAL.dot)} />}
              </button>
            )
          })}
        </div>

        {/* Screenshot panel — click to zoom */}
        <button
          type="button"
          onClick={() => setLightbox(current.img)}
          className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl transition-all group w-full text-left cursor-zoom-in"
        >
          <div className="relative w-full">
            <Image
              key={current.img}
              src={current.img}
              alt={current.title}
              width={current.w}
              height={current.h}
              className="block w-full h-auto bg-white transition-transform duration-300 group-hover:scale-[1.01]"
              sizes="(max-width: 1024px) 100vw, 830px"
              quality={95}
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
          w={current.w}
          h={current.h}
          title={current.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
