import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, ArrowLeft, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import type { Invoice } from '@/types'

export default async function ClientDetailPage({ params }: { params: { name: string } }) {
  const { userId } = await auth()
  if (!userId) return null

  const clientName = decodeURIComponent(params.name)

  const db = createServiceClient()
  const { data } = await db
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .eq('client_name', clientName)
    .order('created_at', { ascending: false })

  if (!data?.length) notFound()

  const invoices = data as Invoice[]
  const today = new Date().toISOString().slice(0, 10)

  const stats = {
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0),
    pending: invoices.filter(i => i.status === 'sent' && i.due_date >= today).reduce((s, i) => s + Number(i.total), 0),
    overdue: invoices.filter(i => i.status === 'sent' && i.due_date < today).reduce((s, i) => s + Number(i.total), 0),
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">{clientName}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50 mb-3">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.paid, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Zaplaceno celkem</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-50 mb-3">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.pending, 'CZK')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Čeká na platbu</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-50 mb-3">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{invoices.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Faktur celkem</p>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Faktury</h2>
          <Link
            href={`/invoices/new`}
            className="text-xs text-indigo-600 hover:underline"
          >
            + Nová faktura
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {invoices.map(inv => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-slate-50 transition group"
            >
              <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm group-hover:text-indigo-600 transition">
                  #{inv.invoice_number}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Vystaven {formatDate(inv.issue_date)} · splatnost {formatDate(inv.due_date)}
                </p>
              </div>
              <StatusBadge status={inv.status} dueDate={inv.due_date} />
              <span className="font-semibold text-slate-800 text-sm shrink-0 text-right tabular-nums">
                {formatCurrency(inv.total, inv.currency)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
