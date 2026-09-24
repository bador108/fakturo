'use client'
import type { ReminderTone } from '@/types'
import { cn } from '@/lib/utils'
import { REMINDER_TONES, REMINDER_LEVEL_LABELS, buildReminder } from '@/lib/reminderTemplates'

interface Props {
  value: ReminderTone
  onChange: (tone: ReminderTone) => void
}

// ukázková faktura jen pro náhled textu upomínek
const PREVIEW = { invoiceNumber: '2026/042', senderName: 'Vaše firma' }
const PREVIEW_DAYS = [3, 7, 14]

export function ReminderTonePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {REMINDER_TONES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            aria-pressed={value === t.value}
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

      <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-3">
        <p className="text-xs font-medium text-slate-500">Náhled — upomínky po splatnosti postupně přitvrzují, ale zůstávají slušné</p>
        {[1, 2, 3].map((level, i) => {
          const { subject, body } = buildReminder({ tone: value, level, days: PREVIEW_DAYS[i], ...PREVIEW })
          return (
            <div key={level} className="text-xs">
              <p className="font-semibold text-slate-700">{REMINDER_LEVEL_LABELS[level]}</p>
              <p className="text-slate-500 mt-0.5">{subject}</p>
              <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{body}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
