'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useLoopClock, usePageVisible } from '../demo/useLoopClock'
import { APP, BrowserBar, DesktopSidebar, AccountBar } from './DesktopChrome'
import { DashboardPage } from './DashboardPage'
import { InvoicesPage, ClientsPage } from './ListPages'
import { ExpensesPage, ExpenseModal } from './ExpensesPage'
import { RecurringPage, RemindersPage } from './SettingsPages'
import { Cursor, cursorAt, type Key } from './Cursor'
import { LOOP, PAGES, T, pageAt, seg } from './timeline'

// místa, kam kurzor jezdí (okno appky 1120×700, px)
const P = {
  rest: [760, 470], navInvoices: [88, 218], navClients: [86, 256], navExpenses: [86, 294], navRecurring: [100, 410], navSettings: [92, 488],
  tabOverdue: [659, 172], clientSearch: [340, 171], clientCard: [396, 291], quickInput: [402, 239], parse: [1021, 239],
  save: [712, 534], toggle: [1025, 328], toneFormal: [813, 130], day30: [300, 575], saveReminders: [353, 631],
} as const
const KEYS: Key[] = [
  [0, P.rest], [3.9, P.rest], [4.8, P.navInvoices, true], [5.9, P.navInvoices, true], [7.2, P.tabOverdue, true], [8.8, P.tabOverdue, true],
  [10.0, P.navClients, true], [10.9, P.navClients], [11.6, P.clientSearch], [12.9, P.clientSearch], [13.4, P.clientCard, true], [14.0, P.clientCard, true],
  [14.6, P.navExpenses, true], [15.3, P.navExpenses], [15.8, P.quickInput], [17.45, P.quickInput], [17.75, P.parse, true], [18.6, P.parse],
  [19.55, P.save, true], [20.1, P.save], [20.9, P.navRecurring, true], [21.8, P.navRecurring], [22.8, P.toggle, true], [24.1, P.toggle],
  [25.1, P.navSettings, true], [26.3, P.navSettings], [26.8, P.toneFormal, true], [27.4, P.toneFormal], [27.9, P.day30, true], [28.4, P.day30],
  [28.9, P.saveReminders, true], [29.6, P.saveReminders], [30.4, P.rest],
]
const CLICKS = [4.95, T.filterOverdue, 10.15, 11.7, 14.75, 15.85, 17.8, T.save, 21.0, T.toggleOn, 25.35, T.toneFormal, T.checkDay, T.saveReminders]
const NAV_AT: Record<string, string> = { navInvoices: 'invoices', navClients: 'clients', navExpenses: 'expenses', navRecurring: 'recurring', navSettings: 'settings' }
// s omezeným pohybem: klidový stav každé stránky
const STILL = [2, 6.2, 11.2, 21.1, 24.5, 29.6]

function Page({ id, t }: { id: string; t: number }) {
  if (id === 'invoices') return <InvoicesPage t={t} />
  if (id === 'clients') return <ClientsPage t={t} />
  if (id === 'expenses') return <ExpensesPage t={t} />
  if (id === 'recurring') return <RecurringPage t={t} />
  if (id === 'reminders') return <RemindersPage t={t} />
  return <DashboardPage t={t} />
}

export function AppDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.7)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const reduced = useReducedMotion() ?? false
  const [stillPage, setStillPage] = useState(0)
  const pageVisible = usePageVisible()
  const { t: clock, seek } = useLoopClock(inView && pageVisible && !reduced, LOOP)
  const t = reduced ? STILL[stillPage] : clock
  const page = pageAt(t)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [9, 0, -4])

  useEffect(() => {
    const el = frame.current
    if (!el) return
    el.setAttribute('inert', '') // jen ukázka — nic uvnitř se nedá ovládat ani fokusovat
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / APP.w))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cur = cursorAt(KEYS, t)
  const hoverKey = Object.keys(P).find(k => P[k as keyof typeof P] === cur.target)
  const select = (i: number) => (reduced ? setStillPage(i) : seek(PAGES[i].from + 0.001))

  return (
    <div ref={ref} className="flex flex-col-reverse gap-6 md:grid md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
      <div className="space-y-1">
        {PAGES.map((p, i) => {
          const on = i === page
          const Icon = p.icon
          const next = PAGES[i + 1]?.from ?? LOOP
          return (
            <button key={p.id} onClick={() => select(i)} className={cn('relative w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl transition-colors overflow-hidden', on ? 'bg-white ring-1 ring-slate-200 shadow-sm' : 'hover:bg-white/60')}>
              <span className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', on ? 'bg-slate-900' : 'bg-slate-100')}><Icon className={cn('h-4 w-4', on ? 'text-white' : 'text-slate-400')} /></span>
              <span className="min-w-0">
                <span className={cn('block text-sm font-semibold leading-tight mt-1.5', on ? 'text-slate-900' : 'text-slate-500')}>{p.title}</span>
                {on && <span className="block text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</span>}
              </span>
              {on && !reduced && <span className="absolute left-0 bottom-0 h-[2px] bg-slate-900" style={{ width: `${seg(t, [p.from, next]) * 100}%` }} />}
            </button>
          )
        })}
      </div>

      <div className="min-w-0" style={{ perspective: 2000 }}>
        <motion.div ref={frame} aria-hidden style={reduced ? undefined : { rotateX, transformOrigin: '50% 100%' }}
          className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_30px_80px_rgba(15,15,30,0.14)]">
          <div className="relative" style={{ height: (APP.h + APP.bar) * scale }}>
            <div className="absolute left-0 top-0 origin-top-left" style={{ width: APP.w, transform: `scale(${scale})` }}>
              <BrowserBar path={PAGES[page].path} />
              <div className="relative flex overflow-hidden bg-paper" style={{ height: APP.h }}>
                <DesktopSidebar active={PAGES[page].path} hover={hoverKey ? NAV_AT[hoverKey] : null} />
                <main className="relative flex-1 px-8 pt-5 overflow-hidden" style={{ opacity: reduced ? 1 : seg(t, [0, 0.25]) * (1 - seg(t, T.fadeOut)) }}>
                  <AccountBar />
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div key={PAGES[page].id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
                      <Page id={PAGES[page].id} t={t} />
                    </motion.div>
                  </AnimatePresence>
                </main>
                {PAGES[page].id === 'expenses' && <ExpenseModal t={t} />}
                {!reduced && <Cursor keys={KEYS} clicks={CLICKS} t={t} />}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
