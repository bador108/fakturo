'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle2, FileText, Loader2, AlertCircle, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Currency } from '@/types'

interface Match {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  amount: number
  currency: string
  txDate: string
}

export function BankStatementUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ transactions: number; matches: Match[] } | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  async function handleFile(file: File) {
    setError('')
    setResult(null)
    setConfirmed(false)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/bank/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Chyba při zpracování'); return }
      setResult(data)
    } catch {
      setError('Nepodařilo se nahrát soubor.')
    } finally {
      setUploading(false)
    }
  }

  async function confirm() {
    if (!result?.matches.length) return
    setConfirming(true)
    try {
      await fetch('/api/bank/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceIds: result.matches.map(m => m.invoiceId) }),
      })
      setConfirmed(true)
    } finally {
      setConfirming(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center py-8 text-center gap-3">
        <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-slate-800">Hotovo!</p>
        <p className="text-sm text-slate-400">{result?.matches.length} faktur označeno jako zaplaceno.</p>
        <button onClick={() => { setResult(null); setConfirmed(false) }} className="text-xs text-indigo-600 hover:underline mt-1">
          Nahrát další výpis
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Exportujte výpis z vašeho internetového bankovnictví (CSV nebo ABO) a nahrajte ho zde.
        Faktury se automaticky označí jako zaplacené.
      </p>

      <div className="text-xs text-slate-400 flex flex-wrap gap-2">
        {['Fio Banka', 'ČSOB', 'Komerční banka', 'Česká spořitelna', 'Raiffeisenbank', 'Air Bank', 'mBank', 'UniCredit', 'Moneta'].map(b => (
          <span key={b} className="bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">{b}</span>
        ))}
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt,.abo,.gpc"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm">Zpracovávám výpis...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload className="h-8 w-8" />
              <p className="text-sm font-medium text-slate-600">Přetáhněte výpis nebo klikněte pro výběr</p>
              <p className="text-xs">CSV, ABO, GPC, TXT</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Načteno <strong>{result.transactions}</strong> transakcí
            {result.matches.length > 0
              ? ` · nalezena shoda pro ${result.matches.length} faktur`
              : ' · žádná shoda s otevřenými fakturami'}
          </p>

          {result.matches.length > 0 ? (
            <>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                {result.matches.map(m => (
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

              <div className="flex gap-2">
                <button
                  onClick={confirm}
                  disabled={confirming}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Označit {result.matches.length} faktur jako zaplaceno
                </button>
                <button onClick={() => setResult(null)} className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg">
                  Zrušit
                </button>
              </div>
            </>
          ) : (
            <button onClick={() => setResult(null)} className="text-sm text-indigo-600 hover:underline">
              Nahrát jiný výpis
            </button>
          )}
        </div>
      )}
    </div>
  )
}
