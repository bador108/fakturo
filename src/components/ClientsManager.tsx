'use client'

import { useState } from 'react'
import { Users, Plus, Pencil, Trash2, X, Search, Building2, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import type { Client } from '@/types'

interface ClientForm {
  name: string
  address: string
  city: string
  zip: string
  country: string
  ico: string
  dic: string
  email: string
  phone: string
  notes: string
}

const EMPTY: ClientForm = {
  name: '', address: '', city: '', zip: '', country: 'CZ',
  ico: '', dic: '', email: '', phone: '', notes: '',
}

export function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<ClientForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [aresLoading, setAresLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.ico ?? '').includes(search) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setForm(EMPTY)
    setEditing(null)
    setModal('add')
  }

  function openEdit(c: Client) {
    setForm({
      name: c.name, address: c.address ?? '', city: c.city ?? '',
      zip: c.zip ?? '', country: c.country, ico: c.ico ?? '',
      dic: c.dic ?? '', email: c.email ?? '', phone: c.phone ?? '',
      notes: c.notes ?? '',
    })
    setEditing(c)
    setModal('edit')
  }

  async function lookupAres() {
    if (!form.ico) return
    setAresLoading(true)
    try {
      const res = await fetch(`/api/ares?ico=${form.ico}`)
      if (!res.ok) return
      const d = await res.json()
      setForm(f => ({
        ...f,
        name: d.name ?? f.name,
        address: d.address ?? f.address,
        city: d.city ?? f.city,
        zip: d.zip ?? f.zip,
        dic: d.dic ?? f.dic,
      }))
    } finally {
      setAresLoading(false)
    }
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (modal === 'edit' && editing) {
        const res = await fetch(`/api/clients/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const updated = await res.json()
          setClients(cs => cs.map(c => c.id === editing.id ? updated : c))
        }
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) {
          const created = await res.json()
          setClients(cs => [...cs, created].sort((a, b) => a.name.localeCompare(b.name)))
        }
      }
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    setClients(cs => cs.filter(c => c.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Klienti</h1>
          <p className="text-sm text-slate-400 mt-0.5">{clients.length} klientů celkem</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nový klient
        </button>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hledat klienta, IČO, email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              {search ? 'Žádný klient nenalezen' : 'Zatím žádní klienti'}
            </p>
            {!search && (
              <button onClick={openAdd} className="mt-4 text-sm text-indigo-600 hover:underline">
                + Přidat prvního klienta
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition group">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 text-indigo-600 font-bold text-sm">
                  {c.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {c.ico && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />IČO {c.ico}
                      </span>
                    )}
                    {c.email && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" />{c.email}
                      </span>
                    )}
                    {c.city && (
                      <span className="text-xs text-slate-400">{c.city}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Link
                    href={`/clients/${encodeURIComponent(c.name)}`}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition text-xs font-medium px-2.5"
                  >
                    Faktury
                  </Link>
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Upravit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Smazat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {modal === 'edit' ? 'Upravit klienta' : 'Nový klient'}
              </h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Název / Jméno *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Firma s.r.o."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">IČO</label>
                  <div className="flex gap-2">
                    <input
                      value={form.ico}
                      onChange={e => setForm(f => ({ ...f, ico: e.target.value }))}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="12345678"
                    />
                    <button
                      onClick={lookupAres}
                      disabled={!form.ico || aresLoading}
                      className="text-xs text-indigo-600 hover:text-indigo-700 px-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition disabled:opacity-40 whitespace-nowrap"
                    >
                      {aresLoading ? '…' : 'ARES'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">DIČ</label>
                  <input
                    value={form.dic}
                    onChange={e => setForm(f => ({ ...f, dic: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="CZ12345678"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Adresa</label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Ulice 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Město</label>
                  <input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Praha"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">PSČ</label>
                  <input
                    value={form.zip}
                    onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="11000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    <Mail className="h-3 w-3 inline mr-1" />Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="info@firma.cz"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    <Phone className="h-3 w-3 inline mr-1" />Telefon
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="+420 777 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Poznámka</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  placeholder="Interní poznámky ke klientovi…"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                Zrušit
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? 'Ukládám…' : modal === 'edit' ? 'Uložit změny' : 'Přidat klienta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-2">Smazat klienta?</h3>
            <p className="text-sm text-slate-500 mb-5">Tato akce je nevratná. Faktury klienta zůstanou zachovány.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm hover:bg-slate-50 transition">Zrušit</button>
              <button onClick={() => remove(deleteId)} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm hover:bg-red-600 transition">Smazat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
