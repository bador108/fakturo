'use client'

import { cn } from '@/lib/utils'
import { REMINDER_TONES, dayOptionLabel, reminderCopy, type ReminderTone } from '@/lib/reminderConfig'

interface Props {
  tone: ReminderTone
  onChange: (tone: ReminderTone) => void
  senderName: string
  /** den, pro který se ukazuje náhled (se znaménkem jako v nastavení) */
  previewDays: number
}

export function ReminderTonePicker({ tone, onChange, senderName, previewDays }: Props) {
  const copy = reminderCopy({ tone, invoiceNumber: '2026/042', senderName, daysToDue: previewDays })

  return (
    <section>
      <h3 className="text-sm font-medium text-slate-900 mb-1">Tón e-mailu</h3>
      <p className="text-xs text-slate-400 mb-3">Jak moc mile nebo přísně bude upomínka napsaná.</p>

      <div role="radiogroup" aria-label="Tón e-mailu" className="grid gap-2 sm:grid-cols-3">
        {REMINDER_TONES.map(t => {
          const active = t.value === tone
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(t.value)}
              className={cn(
                'text-left rounded-lg border p-3 transition-colors',
                active ? 'border-brand ring-1 ring-brand bg-white' : 'border-slate-200 bg-white hover:bg-slate-50'
              )}
            >
              <span className="block text-sm font-medium text-slate-900">{t.label}</span>
              <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">{t.hint}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">
          Náhled e-mailu klientovi · {dayOptionLabel(previewDays)}
        </p>
        <p className="text-sm font-semibold text-slate-900">{copy.subject}</p>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">Dobrý den,<br />{copy.intro}</p>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{copy.outro}</p>
      </div>
    </section>
  )
}
