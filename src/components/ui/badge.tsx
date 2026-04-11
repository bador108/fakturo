import { cn } from '@/lib/utils'
import type { InvoiceStatus } from '@/types'

const statusConfig: Record<InvoiceStatus, { label: string; classes: string }> = {
  draft:     { label: 'Koncept',   classes: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
  sent:      { label: 'Odesláno', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  paid:      { label: 'Zaplaceno', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Storno',   classes: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, classes } = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', classes)}>
      {label}
    </span>
  )
}
