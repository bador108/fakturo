import { Save, Send, Search, UserCheck, ChevronDown, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppTopBar, AccountRow } from './AppChrome'
import { T, seg, easeInOut, typed, czk } from './timeline'

// Posuny obsahu formuláře (px ve 390px zobrazení) — Odběratel a Položky v záběru
export const FORM_SCROLL = { client: 620, items: 1126 }

export function formScroll(t: number): number {
  return easeInOut(seg(t, T.scrollToClient)) * FORM_SCROLL.client
    + easeInOut(seg(t, T.scrollDown)) * (FORM_SCROLL.items - FORM_SCROLL.client)
    - easeInOut(seg(t, T.scrollUp)) * FORM_SCROLL.items
}

function Field({ label, value, active, flash, right, t }: { label: string; value: string; active?: boolean; flash?: boolean; right?: boolean; t: number }) {
  const caret = active && Math.floor(t * 2.4) % 2 === 0
  return (
    <div className="flex flex-col gap-1">
      <span className="h-5 text-sm font-medium text-slate-600 leading-5">{label}</span>
      <div className={cn(
        'h-[38px] rounded-lg border px-3 text-sm text-slate-900 flex items-center transition-colors duration-300',
        right && 'justify-end tabular-nums',
        active ? 'border-transparent ring-2 ring-brand' : 'border-slate-200',
        flash ? 'bg-emerald-50' : 'bg-white',
      )}>
        {value}{caret && <span className="ml-px h-4 w-px bg-slate-900" />}
      </div>
    </div>
  )
}

const card = 'p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4'

export function FormScreen({ t }: { t: number }) {
  const ares = t >= T.aresDone
  const flash = ares && t < T.aresDone + 0.9
  const ico = typed('31415926', t, T.icoType)
  const email = typed('fakturace@studiopixel.cz', t, T.emailType)
  const desc = typed('Redesign webu', t, T.descType)
  const price = typed('24850', t, T.priceType)
  const inRange = (r: readonly [number, number]) => t >= r[0] && t <= r[1] + 0.25
  const sending = t >= T.tapSend

  return (
    <div className="absolute inset-0 bg-paper flex flex-col pt-[47px]">
      <AppTopBar />
      <div className="flex-1 overflow-hidden">
        <div className="px-4 pt-4 space-y-6" style={{ transform: `translateY(${-formScroll(t)}px)` }}>
          <div>
            <AccountRow />
            <h1 className="text-2xl font-semibold text-slate-900 leading-8">Nová faktura</h1>
            <p className="text-sm text-slate-400 mt-0.5 leading-5">Vyplňte údaje níže</p>
            <div className="flex gap-2 mt-3">
              <span className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700"><Save className="h-4 w-4" />Uložit koncept</span>
              <span className={cn('inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-brand text-white text-xs font-medium transition-transform', sending && t < T.tapSend + 0.15 && 'scale-95')}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Odeslat
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Field t={t} label="Typ dokladu" value="Faktura" />
            <Field t={t} label="Číslo faktury" value="2026/042" />
          </div>

          <section className={card}>
            <h2 className="font-semibold text-slate-800 h-7 leading-7">Dodavatel</h2>
            <Field t={t} label="Jméno / firma" value="Jana Nováková" />
            <Field t={t} label="Adresa" value="Korunní 12" />
            <div className="grid grid-cols-2 gap-3"><Field t={t} label="Město" value="Praha 2" /><Field t={t} label="PSČ" value="120 00" /></div>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between h-7">
              <h2 className="font-semibold text-slate-800">Odběratel</h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-brand border border-brand-soft bg-brand-soft px-3 py-1.5 rounded-lg"><UserCheck className="h-3.5 w-3.5" />Vybrat klienta<ChevronDown className="h-3 w-3" /></span>
            </div>
            <Field t={t} label="Jméno / firma" value={ares ? 'Studio Pixel s.r.o.' : ''} flash={flash} />
            <Field t={t} label="Adresa" value={ares ? 'Vinohradská 48' : ''} flash={flash} />
            <div className="grid grid-cols-2 gap-3">
              <Field t={t} label="Město" value={ares ? 'Praha 3' : ''} flash={flash} />
              <Field t={t} label="PSČ" value={ares ? '130 00' : ''} flash={flash} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field t={t} label="IČO" value={ico} active={inRange(T.icoType)} />
              <Field t={t} label="DIČ" value={ares ? 'CZ31415926' : ''} flash={flash} />
            </div>
            <div className="space-y-1">
              <Field t={t} label="E-mail klienta" value={email} active={inRange(T.emailType)} />
              <span className="flex items-center gap-1 h-4 text-xs text-brand"><Search className="h-3 w-3" />{t >= T.tapAres && !ares ? 'Hledám…' : 'Doplnit z ARESu'}</span>
            </div>
          </section>

          <section className={card}>
            <h2 className="font-semibold text-slate-800 h-7 leading-7">Položky</h2>
            <div className="space-y-2 border border-slate-100 rounded-lg p-3">
              <div className={cn('h-[38px] rounded-lg border px-3 text-sm flex items-center', inRange(T.descType) ? 'border-transparent ring-2 ring-brand' : 'border-slate-200', desc ? 'text-slate-900' : 'text-slate-300')}>{desc || 'Popis položky'}</div>
              <div className="grid grid-cols-2 gap-2"><Field t={t} label="Množství" value="1" /><Field t={t} label="Jednotka" value="ks" /></div>
              <Field t={t} label="Cena / jednotku" value={price} active={inRange(T.priceType)} right />
            </div>
            <span className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium text-zinc-600"><Plus className="h-4 w-4" />Přidat položku</span>
            <div className="flex justify-end gap-4 font-bold text-slate-900 text-base border-t border-slate-100 pt-2">
              <span>Celkem</span><span className="min-w-[7rem] text-right font-mono">{czk(Number(price) || 0)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
