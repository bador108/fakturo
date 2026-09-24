import Link from 'next/link'
import { Clock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { reminderLabel, sortReminderDays } from '@/lib/reminderConfig'

interface Props {
  dueDate: string
  /** nastavené dny upomínek (kladné = před splatností, záporné = po ní) */
  reminderDays: number[]
  /** days_offset už odeslaných upomínek (= dní po splatnosti, před splatností záporné) */
  sentOffsets: number[]
  hasClientEmail: boolean
}

type RowStatus = 'sent' | 'planned' | 'skipped'

const STATUS: Record<RowStatus, { label: string; className: string }> = {
  sent: { label: 'Odesláno', className: 'bg-emerald-50 text-emerald-700' },
  planned: { label: 'Naplánováno', className: 'bg-emerald-50 text-emerald-600' },
  skipped: { label: 'Neodesláno', className: 'bg-slate-100 text-slate-400' },
}

// datum splatnosti ± dny, počítané v UTC stejně jako cron (bez posunu časovou zónou)
function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const short = (iso: string) => `${Number(iso.slice(8, 10))}. ${Number(iso.slice(5, 7))}.`

/** Časová osa automatických upomínek u odeslané faktury: splatnost + naplánované / odeslané upomínky. */
export function ReminderTimeline({ dueDate, reminderDays, sentOffsets, hasClientEmail }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const overdue = dueDate < today
  let ordinal = 0

  const rows = sortReminderDays(reminderDays).map(d => {
    const date = shiftDate(dueDate, -d)
    const status: RowStatus = sentOffsets.includes(-d) ? 'sent' : date >= today && hasClientEmail ? 'planned' : 'skipped'
    return { offset: d, date, label: reminderLabel(d < 0 ? ++ordinal : 0), status }
  })
  const before = rows.filter(r => r.offset > 0)
  const after = rows.filter(r => r.offset < 0)

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="font-semibold text-slate-900">Automatické upomínky</h2>
        <Link href="/settings" className="text-xs text-slate-400 hover:text-slate-600">Upravit v Nastavení</Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">Upomínky máš vypnuté.</p>
      ) : (
        <ol className="relative space-y-3 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
          {before.map(r => <Row key={r.offset} {...r} />)}
          <li className="relative flex items-center gap-3">
            <span className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0', overdue ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500')}>
              <Clock className="h-3.5 w-3.5" />
            </span>
            <span className="w-12 text-sm font-semibold text-slate-900">{short(dueDate)}</span>
            <span className="text-sm text-slate-600">Splatnost</span>
            {overdue && <span className="ml-auto text-xs rounded-full px-2 py-0.5 bg-red-50 text-red-600">Po splatnosti</span>}
          </li>
          {after.map(r => <Row key={r.offset} {...r} />)}
        </ol>
      )}

      {!hasClientEmail && rows.length > 0 && (
        <p className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          Faktura nemá vyplněný e-mail klienta, takže upomínky neodejdou.
        </p>
      )}
    </div>
  )
}

function Row({ date, label, status }: { date: string; label: string; status: RowStatus }) {
  const muted = status === 'skipped'
  return (
    <li className={cn('relative flex items-center gap-3', muted && 'opacity-60')}>
      <span className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0', status === 'sent' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600')}>
        <Mail className="h-3.5 w-3.5" />
      </span>
      <span className="w-12 text-sm font-semibold text-slate-900">{short(date)}</span>
      <span className="text-sm text-slate-600">{label}</span>
      <span className={cn('ml-auto text-xs rounded-full px-2 py-0.5', STATUS[status].className)}>{STATUS[status].label}</span>
    </li>
  )
}
