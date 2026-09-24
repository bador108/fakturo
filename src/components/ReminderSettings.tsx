'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReminderTonePicker } from '@/components/ReminderTonePicker'
import type { ReminderTone } from '@/types'
import { REMINDER_DAY_OPTIONS, dayOptionLabel, sortReminderDays } from '@/lib/reminderConfig'

interface Props {
  initialDays: number[]
  initialTone: ReminderTone
  senderName: string
}

export function ReminderSettings({ initialDays, initialTone, senderName }: Props) {
  const [days, setDays] = useState<number[]>(initialDays)
  const [tone, setTone] = useState<ReminderTone>(initialTone)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'saved' | 'error' | null>(null)

  function toggle(val: number) {
    setDays(d => (d.includes(val) ? d.filter(x => x !== val) : [...d, val]))
    setStatus(null)
  }

  async function save() {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/settings/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_days: sortReminderDays(days), reminder_tone: tone }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Fakturo automaticky odesílá upomínky na e-mail klienta.</p>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Tón upomínek</p>
        <ReminderTonePicker value={tone} onChange={t => { setTone(t); setStatus(null) }} senderName={senderName} />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">Kdy upomínky posílat</p>
        <div className="space-y-0.5">
          {REMINDER_DAY_OPTIONS.map(d => (
            <label key={d} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={days.includes(d)}
                onChange={() => toggle(d)}
                className="rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span className="text-sm text-slate-700">{dayOptionLabel(d)}</span>
              {d < 0 && <span className="text-xs text-red-500 ml-auto">po splatnosti</span>}
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Upomínky odcházejí jen u faktur se stavem „Odesláno“ a vyplněným e-mailem klienta. Jakmile je faktura zaplacená, přestanou.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} loading={saving}>Uložit nastavení</Button>
        {status === 'saved' && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" />Uloženo</span>}
        {status === 'error' && <span className="text-sm text-red-500">Nepodařilo se uložit.</span>}
      </div>
    </div>
  )
}
