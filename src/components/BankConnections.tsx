'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Landmark, Loader2, RefreshCw, CheckCircle2, AlertCircle, Check, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Currency } from '@/types'

interface Account {
  iban: string | null
  currency: string
  balance: number | null
  displayName: string | null
}

interface Connection {
  id: string
  institution_name: string | null
  status: string
}

interface Match {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  amount: number
  currency: string
  txDate: string
}

interface Props {
  initialConnections: Connection[]
  initialAccounts: Account[]
}

export function BankConnections({ initialConnections, initialAccounts }: Props) {
  const params = useSearchParams()
  const router = useRouter()

  const [connections] = useState(initialConnections)
  const [accounts, setAccounts] = useState(initialAccounts)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [banner, setBanner] = useState<'connected' | 'error' | null>(
    params.get('bank') === 'connected' ? 'connected' : params.get('bank') === 'error' ? 'error' : null
  )

  useEffect(() => {
    if (banner) {
      router.replace('/settings', { scroll: false })
      const t = setTimeout(() => setBanner(null), 5000)
      return () => clearTimeout(t)
    }
  }, [banner, router])

  const hasActiveConnection = connections.some(c => c.status === 'active')

  async function connect() {
    setConnecting(true)
    setError('')
    try {
      const res = await fetch('/api/bank/connect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Propojení se nezdařilo'); return }
      window.location.href = data.link
    } catch {
      setError('Propojení se nezdařilo.')
      setConnecting(false)
    }
  }

  async function sync() {
    setSyncing(true)
    setError('')
    setMatches(null)
    setConfirmed(false)
    try {
      const res = await fetch('/api/bank/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Synchronizace se nezdařila'); return }
      setAccounts(data.accounts)
      setMatches(data.matches)
    } catch {
      setError('Synchronizace se nezdařila.')
    } finally {
      setSyncing(false)
    }
  }

  async function confirmMatches() {
    if (!matches?.length) return
    setConfirming(true)
    try {
      await fetch('/api/bank/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceIds: matches.map(m => m.invoiceId) }),
      })
      setConfirmed(true)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-4">
      {banner === 'connected' && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Banka úspěšně propojena.
        </div>
      )}
      {banner === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Propojení se nezdařilo. Zkuste to prosím znovu.
        </div>
      )}

      {hasActiveConnection ? (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            {accounts.map((acc, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">{acc.displayName ?? acc.iban ?? 'Účet'}</p>
                <p className={`text-xl font-bold ${acc.balance !== null && acc.balance < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                  {acc.balance !== null ? formatCurrency(acc.balance, acc.currency as Currency) : '—'}
                </p>
                {acc.iban && <p className="text-xs text-slate-400 mt-1">{acc.iban}</p>}
              </div>
            ))}
          </div>

          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Synchronizovat
          </button>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {confirmed ? (
            <p className="text-sm text-emerald-600 font-medium">Hotovo — faktury označeny jako zaplacené.</p>
          ) : matches && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                {matches.length > 0 ? `Nalezena shoda pro ${matches.length} faktur` : 'Žádná shoda s otevřenými fakturami'}
              </p>
              {matches.length > 0 && (
                <>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    {matches.map(m => (
                      <div key={m.invoiceId} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                        <div className="h-7 w-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{m.clientName}</p>
                          <p className="text-xs text-slate-400">#{m.invoiceNumber} · {m.txDate}</p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatCurrency(m.amount, m.currency as Currency)}
                        </span>
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={confirmMatches}
                    disabled={confirming}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Označit {matches.length} faktur jako zaplaceno
                  </button>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Propojte bankovní účet — faktury se pak automaticky označí jako zaplacené a uvidíte živý zůstatek.
          </p>
          <button
            onClick={connect}
            disabled={connecting}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
            Připojit banku
          </button>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  )
}
