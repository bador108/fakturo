'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Trash2, FileDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { calcTotals, formatCurrency } from '@/lib/utils'
import type { InvoiceFormData, InvoiceItemDraft, Currency, VatRate } from '@/types'

const DEFAULT_ITEM: InvoiceItemDraft = { description: '', quantity: 1, unit: 'ks', unit_price: 0 }

const today = new Date().toISOString().slice(0, 10)
const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
const year = new Date().getFullYear()

const defaultForm: InvoiceFormData = {
  invoice_type: 'faktura',
  sender_name: '', sender_address: '', sender_city: '', sender_zip: '', sender_country: 'CZ',
  sender_ico: '', sender_dic: '', sender_bank: '', sender_iban: '', sender_email: '', sender_phone: '',
  client_name: '', client_address: '', client_city: '', client_zip: '', client_country: 'CZ', client_ico: '',
  client_email: '',
  invoice_number: `${year}0001`, issue_date: today, due_date: due,
  currency: 'CZK', vat_rate: 21, notes: '', items: [{ ...DEFAULT_ITEM }],
}

export default function GeneratorPage() {
  const [form, setForm] = useState<InvoiceFormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [aresLoading, setAresLoading] = useState<'sender' | 'client' | null>(null)
  const [aresError, setAresError] = useState<'sender' | 'client' | null>(null)

  const set = useCallback(<K extends keyof InvoiceFormData>(key: K, value: InvoiceFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }))
  }, [])

  const setItem = useCallback((index: number, field: keyof InvoiceItemDraft, value: string | number) => {
    setForm(f => {
      const items = f.items.map((item, i) =>
        i === index ? { ...item, [field]: field === 'description' || field === 'unit' ? value : Number(value) } : item
      )
      return { ...f, items }
    })
  }, [])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...DEFAULT_ITEM }] }))
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const { subtotal, vat_amount, total } = calcTotals(form.items, form.vat_rate)

  async function lookupAres(type: 'sender' | 'client') {
    const ico = type === 'sender' ? form.sender_ico : form.client_ico
    if (!ico) return
    setAresLoading(type)
    setAresError(null)
    try {
      const res = await fetch(`/api/ares?ico=${encodeURIComponent(ico)}`)
      if (!res.ok) { setAresError(type); return }
      const data = await res.json()
      if (type === 'sender') {
        setForm(f => ({ ...f, sender_name: data.name || f.sender_name, sender_address: data.address || f.sender_address, sender_city: data.city || f.sender_city, sender_zip: data.zip || f.sender_zip, sender_dic: data.dic || f.sender_dic }))
      } else {
        setForm(f => ({ ...f, client_name: data.name || f.client_name, client_address: data.address || f.client_address, client_city: data.city || f.client_city, client_zip: data.zip || f.client_zip }))
      }
    } catch { setAresError(type) }
    finally { setAresLoading(null) }
  }

  async function downloadPdf() {
    setLoading(true)
    try {
      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { alert('Chyba při generování PDF'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faktura-${form.invoice_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">Fakturo</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Generátor zdarma · bez registrace</span>
            <Link href="/sign-up" className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium">
              Registrovat zdarma
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Generátor faktur zdarma</h1>
            <p className="text-sm text-slate-400 mt-0.5">Vytvořte fakturu bez registrace · PDF ke stažení zdarma</p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={loading || !form.sender_name || !form.client_name}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {loading ? 'Generuji…' : 'Stáhnout PDF'}
          </button>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
          <Input label="Číslo faktury" value={form.invoice_number} onChange={e => set('invoice_number', e.target.value)} />
          <Select label="Měna" value={form.currency} onChange={e => set('currency', e.target.value as Currency)}>
            <option value="CZK">CZK – Česká koruna</option>
            <option value="EUR">EUR – Euro</option>
            <option value="USD">USD – US Dollar</option>
          </Select>
          <Input label="Datum vystavení" type="date" value={form.issue_date} onChange={e => set('issue_date', e.target.value)} />
          <Input label="Datum splatnosti" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
        </div>

        {/* Sender + Client */}
        <div className="grid md:grid-cols-2 gap-5">
          <section className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800">Dodavatel (vy)</h2>
            <div className="space-y-1">
              <Input label="IČO" value={form.sender_ico} onChange={e => set('sender_ico', e.target.value)} />
              <button type="button" onClick={() => lookupAres('sender')} disabled={!form.sender_ico || aresLoading === 'sender'} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline disabled:opacity-40">
                <Search className="h-3 w-3" />{aresLoading === 'sender' ? 'Hledám…' : 'Doplnit z ARESu'}
              </button>
              {aresError === 'sender' && <p className="text-xs text-red-500">Firma nenalezena</p>}
            </div>
            <Input label="Jméno / firma" value={form.sender_name} onChange={e => set('sender_name', e.target.value)} />
            <Input label="Adresa" value={form.sender_address} onChange={e => set('sender_address', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Město" value={form.sender_city} onChange={e => set('sender_city', e.target.value)} />
              <Input label="PSČ" value={form.sender_zip} onChange={e => set('sender_zip', e.target.value)} />
            </div>
            <Input label="DIČ" value={form.sender_dic} onChange={e => set('sender_dic', e.target.value)} />
            <Input label="Číslo účtu / IBAN" placeholder="CZ65 0800 0000 1920 0014 5399" value={form.sender_iban} onChange={e => set('sender_iban', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="E-mail" type="email" value={form.sender_email} onChange={e => set('sender_email', e.target.value)} />
              <Input label="Telefon" value={form.sender_phone} onChange={e => set('sender_phone', e.target.value)} />
            </div>
          </section>

          <section className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800">Odběratel (klient)</h2>
            <div className="space-y-1">
              <Input label="IČO" value={form.client_ico} onChange={e => set('client_ico', e.target.value)} />
              <button type="button" onClick={() => lookupAres('client')} disabled={!form.client_ico || aresLoading === 'client'} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline disabled:opacity-40">
                <Search className="h-3 w-3" />{aresLoading === 'client' ? 'Hledám…' : 'Doplnit z ARESu'}
              </button>
              {aresError === 'client' && <p className="text-xs text-red-500">Firma nenalezena</p>}
            </div>
            <Input label="Jméno / firma" value={form.client_name} onChange={e => set('client_name', e.target.value)} />
            <Input label="Adresa" value={form.client_address} onChange={e => set('client_address', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Město" value={form.client_city} onChange={e => set('client_city', e.target.value)} />
              <Input label="PSČ" value={form.client_zip} onChange={e => set('client_zip', e.target.value)} />
            </div>
          </section>
        </div>

        {/* Items */}
        <section className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Položky</h2>
            <Select label="" className="w-40" value={form.vat_rate} onChange={e => set('vat_rate', Number(e.target.value) as VatRate)}>
              <option value={0}>DPH 0 %</option>
              <option value={15}>DPH 15 %</option>
              <option value={21}>DPH 21 %</option>
            </Select>
          </div>
          <div className="hidden md:grid grid-cols-[1fr_80px_90px_110px_40px] gap-3 text-xs font-medium text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
            <span>Popis</span><span>Množství</span><span>Jedn.</span><span className="text-right">Cena / jedn.</span><span />
          </div>
          {form.items.map((item, i) => (
            <div key={i} className="grid md:grid-cols-[1fr_80px_90px_110px_40px] gap-3 items-end">
              <Input placeholder="Popis položky" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} />
              <Input type="number" min={0} step="0.001" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
              <Input placeholder="ks" value={item.unit} onChange={e => setItem(i, 'unit', e.target.value)} />
              <Input type="number" min={0} step="0.01" className="text-right" value={item.unit_price} onChange={e => setItem(i, 'unit_price', e.target.value)} />
              <button type="button" onClick={() => removeItem(i)} disabled={form.items.length === 1} className="p-2 text-slate-300 hover:text-red-400 transition disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
            <Plus className="h-4 w-4" />Přidat položku
          </button>
          <div className="mt-4 flex flex-col items-end gap-1 text-sm">
            <div className="flex gap-8 text-slate-400">
              <span>Základ DPH</span>
              <span className="w-32 text-right font-mono">{formatCurrency(subtotal, form.currency)}</span>
            </div>
            <div className="flex gap-8 text-slate-400">
              <span>DPH ({form.vat_rate} %)</span>
              <span className="w-32 text-right font-mono">{formatCurrency(vat_amount, form.currency)}</span>
            </div>
            <div className="flex gap-8 font-bold text-slate-900 text-base border-t border-slate-100 pt-2 mt-1">
              <span>Celkem</span>
              <span className="w-32 text-right font-mono">{formatCurrency(total, form.currency)}</span>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-600 mb-2">Poznámky</label>
          <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Platební podmínky, bankovní spojení, poděkování..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </section>

        {/* CTA */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-indigo-900">Chcete ukládat faktury a sledovat platby?</p>
            <p className="text-sm text-indigo-600 mt-1">Registrace zdarma · 30 faktur měsíčně bez poplatku</p>
          </div>
          <Link href="/sign-up" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
            Registrovat zdarma
          </Link>
        </div>

        <div className="pb-8 flex justify-center">
          <button
            onClick={downloadPdf}
            disabled={loading || !form.sender_name || !form.client_name}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {loading ? 'Generuji PDF…' : 'Stáhnout PDF zdarma'}
          </button>
        </div>
      </div>
    </div>
  )
}
