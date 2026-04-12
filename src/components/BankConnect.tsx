'use client'

import { useState, useEffect } from 'react'
import { Building2, CheckCircle2, RefreshCw, Trash2, Loader2, ChevronDown, Search } from 'lucide-react'

interface Institution {
  id: string
  name: string
  logo: string
}

interface BankConnection {
  institution_name: string
  institution_logo: string | null
  status: string
  last_synced_at: string | null
}

export function BankConnect({ connection }: { connection: BankConnection | null }) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ matched: number; total: number } | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [conn, setConn] = useState<BankConnection | null>(connection)

  useEffect(() => {
    // Check URL params for bank=success/error after redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('bank') === 'success') {
      window.location.href = '/settings'
    }
  }, [])

  async function loadInstitutions() {
    if (institutions.length > 0) { setShowList(true); return }
    setLoading(true)
    try {
      const res = await fetch('/api/bank/institutions')
      const data = await res.json()
      setInstitutions(Array.isArray(data) ? data : [])
      setShowList(true)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function connect(institutionId: string) {
    setLoading(true)
    setShowList(false)
    try {
      const res = await fetch('/api/bank/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId }),
      })
      const data = await res.json()
      if (data.link) window.location.href = data.link
    } catch {
      setLoading(false)
    }
  }

  async function sync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/bank/sync', { method: 'POST' })
      const data = await res.json()
      setSyncResult(data)
      setConn(c => c ? { ...c, last_synced_at: new Date().toISOString() } : c)
    } catch {
      // ignore
    } finally {
      setSyncing(false)
    }
  }

  async function disconnect() {
    setDisconnecting(true)
    try {
      await fetch('/api/bank/disconnect', { method: 'DELETE' })
      setConn(null)
    } finally {
      setDisconnecting(false)
    }
  }

  const filtered = institutions.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  if (conn?.status === 'active') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          {conn.institution_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={conn.institution_logo} alt={conn.institution_name} className="h-8 w-8 rounded-lg object-contain" />
          ) : (
            <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">{conn.institution_name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Propojeno
              {conn.last_synced_at && ` · Sync ${new Date(conn.last_synced_at).toLocaleDateString('cs-CZ')}`}
            </p>
          </div>
        </div>

        {syncResult && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            Synchronizace dokončena — nalezeno {syncResult.total} transakcí,
            {syncResult.matched > 0
              ? ` označeno ${syncResult.matched} faktur jako zaplaceno.`
              : ' žádná nová shoda.'}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Synchronizovat nyní
          </button>
          <button
            onClick={disconnect}
            disabled={disconnecting}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition"
          >
            <Trash2 className="h-4 w-4" />
            Odpojit banku
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Propojte svůj bankovní účet a faktury se automaticky označí jako zaplacené jakmile přijde platba.
      </p>

      {!showList ? (
        <button
          onClick={loadInstitutions}
          disabled={loading}
          className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Načítám banky...</>
            : <><Building2 className="h-4 w-4" /> Vybrat banku <ChevronDown className="h-3.5 w-3.5" /></>
          }
        </button>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hledat banku..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
            {filtered.slice(0, 30).map(inst => (
              <button
                key={inst.id}
                onClick={() => connect(inst.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
              >
                {inst.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inst.logo} alt={inst.name} className="h-7 w-7 rounded object-contain shrink-0" />
                ) : (
                  <div className="h-7 w-7 bg-slate-100 rounded flex items-center justify-center shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                )}
                <span className="text-sm text-slate-700">{inst.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">Banka nenalezena</p>
            )}
          </div>
          <div className="p-2 border-t border-slate-100">
            <button onClick={() => setShowList(false)} className="text-xs text-slate-400 hover:text-slate-600 w-full text-center py-1">Zrušit</button>
          </div>
        </div>
      )}
    </div>
  )
}
