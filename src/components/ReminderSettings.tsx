'use client'

import { useState } from 'react'
import { Check, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReminderTonePicker } from '@/components/ReminderTonePicker'
import { cn } from '@/lib/utils'
import {
  REMINDER_DAYS_AFTER, REMINDER_DAYS_BEFORE, REMINDER_PRESETS,
  dayOptionLabel, matchPreset, sortReminderDays, type ReminderTone,
} from '@/lib/reminderConfig'

interface Props {
  initialDays: number[]
  initialTone: ReminderTone
  senderName: string
}

const chip = (active: boolean) => cn(
  'px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors',
  active ? 'bg-brand border-brand text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
)

export function ReminderSettings({ initialDays, initialTone, senderName }: Props) {
  const [days, setDays] = useState<number[]>(sortReminderDays(initialDays))
  const [tone, setTone] = useState<ReminderTone>(initialTone)
  const [custom, setCustom] = useState(() => matchPreset(initialDays) === null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'saved' | 'error' | null>(null)

  const preset = custom ? null : matchPreset(days)
  // náhled ukazuje první upomínku po splatnosti, jinak první před ní
  const previewDays = days.find(d => d < 0) ?? days[0] ?? -7

  function change(next: number[]) {
    setDays(sortReminderDays(next))
    setStatus(null)
  }

  function toggle(val: number) {
    change(days.includes(val) ? days.filter(x => x !== val) : [...days, val])
  }

  async function save() {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/settings/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_days: days, reminder_tone: tone }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="flex gap-2 text-sm text-slate-500">
        <Mail className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
        Upomínky chodí e-mailem přímo klientovi, na adresu vyplněnou na faktuře. Jen u faktur se stavem „Odesláno“.
      </p>

      <section>
        <h3 className="text-sm font-medium text-slate-900 mb-1">Jak často</h3>
        <p className="text-xs text-slate-400 mb-3">Kolikrát a kdy klientovi upomínka přijde. Jakmile fakturu označíš jako zaplacenou, upomínky přestanou.</p>
        <div className="flex flex-wrap gap-2">
          {REMINDER_PRESETS.map(p => (
            <button key={p.id} type="button" className={chip(preset === p.id)} onClick={() => { setCustom(false); change(p.days) }}>
              {p.label}
            </button>
          ))}
          <button type="button" className={chip(custom)} onClick={() => setCustom(true)}>Vlastní</button>
        </div>

        {days.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {days.map(d => (
              <span key={d} className={cn('text-xs rounded-md px-2 py-1', d > 0 ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600')}>
                {dayOptionLabel(d)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 mt-3">Upomínky jsou vypnuté.</p>
        )}

        {custom && (
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            {[['Před splatností', REMINDER_DAYS_BEFORE], ['Po splatnosti', REMINDER_DAYS_AFTER]].map(([title, opts]) => (
              <div key={title as string}>
                <p className="text-xs font-medium text-slate-500 mb-1">{title as string}</p>
                {(opts as number[]).map(d => (
                  <label key={d} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={days.includes(d)} onChange={() => toggle(d)} className="rounded border-slate-300 text-brand focus:ring-brand" />
                    <span className="text-sm text-slate-700">{dayOptionLabel(d)}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <ReminderTonePicker tone={tone} onChange={t => { setTone(t); setStatus(null) }} senderName={senderName} previewDays={previewDays} />

      <div className="flex items-center gap-3">
        <Button onClick={save} loading={saving}>Uložit nastavení</Button>
        {status === 'saved' && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" />Uloženo</span>}
        {status === 'error' && <span className="text-sm text-red-500">Nepodařilo se uložit.</span>}
      </div>
    </div>
  )
}
