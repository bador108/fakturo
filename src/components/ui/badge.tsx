import { cn } from '@/lib/utils'
import type { InvoiceStatus } from '@/types'

const statusConfig: Record<InvoiceStatus, { label: string; classes: string }> = {
  draft:     { label: 'Koncept',    classes: 'bg-slate-100 text-slate-500' },
  sent:      { label: 'Odesláno',  classes: 'bg-blue-50 text-blue-600' },
  paid:      { label: 'Zaplaceno', classes: 'bg-emerald-50 text-emerald-600' },
  cancelled: { label: 'Storno',    classes: 'bg-red-50 text-red-500' },
}

const today = () => new Date().toISOString().slice(0, 10)

export function StatusBadge({ status, dueDate }: { status: InvoiceStatus; dueDate?: string }) {
  const isOverdue = status === 'sent' && dueDate && dueDate < today()
  const { label, classes } = isOverdue
    ? { label: 'Po splatnosti', classes: 'bg-red-50 text-red-600' }
    : statusConfig[status]

  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', classes)}>
      {label}
    </span>
  )
}
