import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Users, FileText } from 'lucide-react'
import type { Invoice } from '@/types'

interface ClientSummary {
  name: string
  invoiceCount: number
  paidTotal: number
  pendingTotal: number
  lastInvoice: string
}

export default async function ClientsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const { data } = await db
    .from('invoices')
    .select('client_name, status, total, currency, due_date, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const invoices = (data ?? []) as Pick<Invoice, 'client_name' | 'status' | 'total' | 'currency' | 'due_date' | 'created_at'>[]

  // Group by client
  const clientMap = new Map<string, ClientSummary>()
  for (const inv of invoices) {
    const existing = clientMap.get(inv.client_name) ?? {
      name: inv.client_name,
      invoiceCount: 0,
      paidTotal: 0,
      pendingTotal: 0,
      lastInvoice: inv.created_at,
    }
    existing.invoiceCount++
    if (inv.status === 'paid') existing.paidTotal += Number(inv.total)
    else if (inv.status === 'sent') existing.pendingTotal += Number(inv.total)
    if (inv.created_at > existing.lastInvoice) existing.lastInvoice = inv.created_at
    clientMap.set(inv.client_name, existing)
  }

  const clients = Array.from(clientMap.values()).sort((a, b) =>
    b.lastInvoice.localeCompare(a.lastInvoice)
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Klienti</h1>
          <p className="text-sm text-slate-400 mt-0.5">{clients.length} klientů celkem</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Zatím žádní klienti</p>
            <p className="text-xs text-slate-400 mt-1">Klienti se přidají automaticky při vytvoření faktury</p>
            <Link
              href="/invoices/new"
              className="mt-5 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <FileText className="h-4 w-4" />
              Nová faktura
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {clients.map(client => (
              <Link
                key={client.name}
                href={`/clients/${encodeURIComponent(client.name)}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition group"
              >
                <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 text-indigo-500 font-bold text-sm">
                  {client.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm group-hover:text-indigo-600 transition truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {client.invoiceCount} {client.invoiceCount === 1 ? 'faktura' : client.invoiceCount < 5 ? 'faktury' : 'faktur'}
                    {client.pendingTotal > 0 && (
                      <span className="text-amber-600 ml-2">· čeká {formatCurrency(client.pendingTotal, 'CZK')}</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 tabular-nums">
                    {formatCurrency(client.paidTotal, 'CZK')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">zaplaceno</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
