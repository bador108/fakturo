'use client'

import { useState } from 'react'
import type { ReminderTone } from '@/types'
import { cn } from '@/lib/utils'
import { REMINDER_TONES, buildReminder, reminderLabel } from '@/lib/reminderConfig'

interface Props {
  value: ReminderTone
  onChange: (tone: ReminderTone) => void
  senderName: string
}

// ukázka pro náhled: 1.–3. upomínka jde 3, 7 a 14 dní po splatnosti
const PREVIEW_DAYS = [3, 7, 14]

export function ReminderTonePicker({ value, onChange, senderName }: Props) {
  const [ordinal, setOrdinal] = useState(1)
  const copy = buildReminder({ tone: value, ordinal, days: PREVIEW_DAYS[ordinal - 1], invoiceNumber: '2026/042', senderName })

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Tón upomínek" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {REMINDER_TONES.map(t => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={value === t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'text-left rounded-lg border p-3 transition-colors',
              value === t.value ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'
            )}
          >
            <span className="block text-sm font-semibold text-slate-900">{t.label}</span>
            <span className="block text-xs text-slate-500 mt-0.5">{t.description}</span>
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <p className="text-xs text-slate-400">Náhled — {reminderLabel(ordinal)}</p>
          <div className="flex gap-1">
            {[1, 2, 3].map(o => (
              <button
                key={o}
                type="button"
                onClick={() => setOrdinal(o)}
                aria-pressed={o === ordinal}
                className={cn(
                  'text-xs rounded-md px-2 py-0.5 transition-colors',
                  o === ordinal ? 'bg-white border border-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {o}.
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-900">{copy.subject}</p>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{copy.greeting}<br />{copy.text}</p>
      </div>
      <p className="text-xs text-slate-400">Každá další upomínka po splatnosti trochu přitvrdí, ale zůstane slušná.</p>
    </div>
  )
}
