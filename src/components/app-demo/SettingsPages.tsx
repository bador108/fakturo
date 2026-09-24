import { Plus, RefreshCw, ToggleLeft, ToggleRight, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReminderTonePicker } from '@/components/ReminderTonePicker'
import { REMINDER_DAY_OPTIONS, dayOptionLabel } from '@/lib/reminderConfig'
import { T, seg, easeInOut } from './timeline'

const TEMPLATES = [
  { name: 'Správa webu', meta: 'Studio Pixel s.r.o. · Měsíčně · příští 1. 10. 2026' },
  { name: 'Hosting a údržba', meta: 'Káva & Kód · Čtvrtletně · příští 1. 10. 2026' },
  { name: 'Licence e‑shopu', meta: 'Café Novus s.r.o. · Ročně · příští 15. 1. 2027', paused: true },
]

export function RecurringPage({ t }: { t: number }) {
  return (
    <div className="space-y-5 max-w-[824px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Opakující se faktury</h1>
          <p className="text-sm text-slate-400 mt-0.5">Automaticky generované faktury podle plánu</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium"><Plus className="h-4 w-4" />Nová šablona</span>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {TEMPLATES.map(r => {
          const on = !r.paused || t >= T.toggleOn
          return (
            <div key={r.name} className="flex items-center gap-3 px-6 py-4">
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', on ? 'bg-brand-soft' : 'bg-slate-100')}><RefreshCw className={cn('h-4 w-4', on ? 'text-indigo-400' : 'text-slate-400')} /></div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium text-sm', on ? 'text-slate-800' : 'text-slate-400')}>{r.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.meta}</p>
              </div>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', on ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400')}>{on ? 'Aktivní' : 'Pozastaveno'}</span>
              <span data-toggle={r.name}>{on ? <ToggleRight className="h-5 w-5 text-brand" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}</span>
              <Trash2 className="h-4 w-4 text-slate-300" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// o kolik se Nastavení posune dolů, aby byla karta Upomínky v záběru
export const SETTINGS_SCROLL = 350

export function RemindersPage({ t }: { t: number }) {
  const scroll = easeInOut(seg(t, T.settingsScroll)) * SETTINGS_SCROLL
  const tone = t >= T.toneFormal ? 'formalni' : 'pratelsky'
  const days = t >= T.checkDay ? [3, -3, -7, -14, -30] : [3, -3, -7, -14]
  const saved = t >= T.saveReminders + 0.3
  return (
    <div className="max-w-2xl space-y-6" style={{ transform: `translateY(${-scroll}px)` }}>
      <h1 className="text-2xl font-bold text-zinc-900">Nastavení</h1>
      <div className="p-5 bg-white rounded-xl border border-zinc-200 space-y-3">
        <h2 className="font-semibold">Plán a předplatné</h2>
        <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">Pro plán</span> · měsíční předplatné</p>
        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div><p className="text-sm font-medium text-slate-900">Automaticky obnovovat</p><p className="text-xs text-slate-500 mt-1">Další platba proběhne 24. 10. 2026. Vypnout můžeš kdykoliv.</p></div>
          <span className="relative h-6 w-11 rounded-full bg-brand"><i className="absolute top-0.5 left-[22px] h-5 w-5 rounded-full bg-white shadow" /></span>
        </div>
      </div>
      <div className="p-5 bg-white rounded-xl border border-zinc-200 space-y-5">
        <div>
          <h2 className="font-semibold mb-1">Upomínky</h2>
          <p className="text-sm text-slate-500">Fakturo automaticky odesílá upomínky na e‑mail klienta.</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Tón upomínek</p>
          <ReminderTonePicker value={tone} onChange={() => {}} senderName="Jana Nováková" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Kdy upomínky posílat</p>
          <div className="grid grid-cols-2 gap-x-6">
            {REMINDER_DAY_OPTIONS.map(d => (
              <div key={d} data-day={d} className="flex items-center gap-3 px-2 h-9 rounded-lg">
                <span className={cn('h-4 w-4 rounded border flex items-center justify-center', days.includes(d) ? 'bg-brand border-brand' : 'border-slate-300')}>{days.includes(d) && <Check className="h-3 w-3 text-white" />}</span>
                <span className="text-sm text-slate-700">{dayOptionLabel(d)}</span>
                {d < 0 && <span className="text-xs text-red-500 ml-auto">po splatnosti</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span data-save className={cn('inline-flex items-center px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium transition-transform', t >= T.saveReminders && t < T.saveReminders + 0.12 && 'scale-95')}>Uložit nastavení</span>
          {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" />Uloženo</span>}
        </div>
      </div>
    </div>
  )
}
