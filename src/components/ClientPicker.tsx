'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, UserCheck } from 'lucide-react'
import type { Client } from '@/types'

interface Props {
  onSelect: (c: Client) => void
}

export function ClientPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || loaded) return
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setClients(d) })
      .finally(() => setLoaded(true))
  }, [open, loaded])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.ico ?? '').includes(search)
  )

  function select(c: Client) {
    onSelect(c)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
      >
        <UserCheck className="h-3.5 w-3.5" />
        Vybrat klienta
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-72">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hledat klienta…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {!loaded ? (
              <p className="text-xs text-slate-400 px-3 py-4 text-center">Načítám…</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-slate-400 px-3 py-4 text-center">
                {clients.length === 0 ? 'Žádní uložení klienti' : 'Nenalezen'}
              </p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => select(c)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition"
                >
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">
                    {[c.ico && `IČO ${c.ico}`, c.city].filter(Boolean).join(' · ')}
                  </p>
                </button>
              ))
            )}
          </div>
          {clients.length === 0 && loaded && (
            <div className="px-3 py-2 border-t border-slate-100">
              <a href="/clients" className="text-xs text-indigo-600 hover:underline">+ Přidat klienta do adresáře →</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
