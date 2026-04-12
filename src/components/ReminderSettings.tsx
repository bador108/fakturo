'use client'

import { useState } from 'react'
import { Check, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  userId: string
  initialDays: number[]
}

const OPTIONS = [
  { value: 1, label: '1 den před splatností' },
  { value: 3, label: '3 dny před splatností' },
  { value: 7, label: '7 dní před splatností' },
  { value: 14, label: '14 dní před splatností' },
  { value: 1, label: '1 den po splatnosti' },
  { value: 3, label: '3 dny po splatnosti' },
  { value: 7, label: '7 dní po splatnosti' },
  { value: 14, label: '14 dní po splatnosti' },
  { value: 30, label: '30 dní po splatnosti' },
]

// We distinguish before/after with sign: positive = before, negative = after
const BEFORE = [1, 3, 7, 14].map(d => ({ value: d, label: `${d} ${d === 1 ? 'den' : d < 5 ? 'dny' : 'dní'} před splatností` }))
const AFTER  = [1, 3, 7, 14, 30].map(d => ({ value: -d, label: `${d} ${d === 1 ? 'den' : d < 5 ? 'dny' : 'dní'} po splatnosti` }))
const ALL_OPTIONS = [...BEFORE, ...AFTER]

void OPTIONS

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ReminderSettings({ userId, initialDays }: Props) {
  const [days, setDays] = useState<number[]>(initialDays)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(val: number) {
    setDays(d => d.includes(val) ? d.filter(x => x !== val) : [...d, val])
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/settings/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_days: days }),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Fakturo automaticky odesílá upomínky na e-mail klienta. Vyberte, kdy chcete upomínky zasílat.
      </p>
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
        <Bell className="h-3.5 w-3.5 shrink-0" />
        Upomínky jsou odesílány pouze fakturám se statusem &quot;Odesláno&quot; a vyplněným e-mailem klienta.
      </div>
      <div className="space-y-1">
        {ALL_OPTIONS.map(opt => (
          <label key={opt.value} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={days.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">{opt.label}</span>
            {opt.value < 0 && <span className="text-xs text-red-500 ml-auto">po splatnosti</span>}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={save} loading={saving}>Uložit nastavení</Button>
        {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" />Uloženo</span>}
      </div>
    </div>
  )
}
