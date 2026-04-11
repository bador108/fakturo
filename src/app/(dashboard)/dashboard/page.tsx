import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, FileText } from 'lucide-react'
import type { Invoice } from '@/types'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()

  const [{ data: invoices }, { data: user }] = await Promise.all([
    db.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('users').select('plan, invoice_count_this_month').eq('id', userId).single(),
  ])

  const plan = user?.plan ?? 'free'
  const usedThisMonth = user?.invoice_count_this_month ?? 0
  const atLimit = plan === 'free' && usedThisMonth >= FREE_TIER_LIMIT

  const stats = {
    total: invoices?.length ?? 0,
    paid: invoices?.filter(i => i.status === 'paid').length ?? 0,
    draft: invoices?.filter(i => i.status === 'draft').length ?? 0,
    revenue: invoices?.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0) ?? 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Přehled</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {plan === 'free'
              ? `${usedThisMonth} / ${FREE_TIER_LIMIT} faktur tento měsíc (Free)`
              : 'Pro plán · neomezené faktury'}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/invoices/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nová faktura
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Celkem faktur', value: stats.total },
          { label: 'Zaplaceno', value: stats.paid },
          { label: 'Koncepty', value: stats.draft },
          { label: 'Celkový příjem', value: formatCurrency(stats.revenue, 'CZK') },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Faktury</h2>
        </div>

        {!invoices?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <FileText className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">Zatím žádné faktury</p>
            <Link href="/invoices/new" className="mt-4 text-sm text-indigo-600 hover:underline">
              Vytvořit první fakturu →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(invoices as Invoice[]).map(inv => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                    {inv.invoice_number} · {inv.client_name}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Vystaveno {formatDate(inv.issue_date)} · splatnost {formatDate(inv.due_date)}
                  </p>
                </div>
                <StatusBadge status={inv.status} />
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-sm w-28 text-right">
                  {formatCurrency(inv.total, inv.currency)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

