'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Send, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { calcTotals, formatCurrency } from '@/lib/utils'
import type { InvoiceFormData, InvoiceItemDraft, Currency, VatRate } from '@/types'

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormData>
  invoiceId?: string    // present when editing
  nextInvoiceNumber: string
}

const DEFAULT_ITEM: InvoiceItemDraft = {
  description: '',
  quantity: 1,
  unit: 'ks',
  unit_price: 0,
}

export function InvoiceForm({ defaultValues, invoiceId, nextInvoiceNumber }: InvoiceFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const [form, setForm] = useState<InvoiceFormData>({
    sender_name: '',
    sender_address: '',
    sender_city: '',
    sender_zip: '',
    sender_country: 'CZ',
    sender_ico: '',
    sender_dic: '',
    sender_bank: '',
    sender_iban: '',
    sender_email: '',
    sender_phone: '',
    client_name: '',
    client_address: '',
    client_city: '',
    client_zip: '',
    client_country: 'CZ',
    client_ico: '',
    invoice_number: nextInvoiceNumber,
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    currency: 'CZK',
    vat_rate: 21,
    notes: '',
    items: [{ ...DEFAULT_ITEM }],
    ...defaultValues,
  })

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

  async function save(status: 'draft' | 'sent') {
    setSaving(true)
    try {
      const payload = { ...form, subtotal, vat_amount, total, status }
      const url = invoiceId ? `/api/invoices/${invoiceId}` : '/api/invoices'
      const method = invoiceId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Chyba při ukládání faktury')
        return
      }
      const data = await res.json()
      router.push(`/invoices/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  async function downloadPdf() {
    if (!invoiceId) return
    setGeneratingPdf(true)
    try {
      const res = await fetch(`/api/pdf/${invoiceId}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faktura-${form.invoice_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {invoiceId ? `Faktura ${form.invoice_number}` : 'Nová faktura'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Vyplňte údaje níže</p>
        </div>
        <div className="flex gap-2">
          {invoiceId && (
            <Button variant="secondary" size="sm" onClick={downloadPdf} loading={generatingPdf}>
              <FileDown className="h-4 w-4" />
              PDF
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => save('draft')} loading={saving}>
            <Save className="h-4 w-4" />
            Uložit koncept
          </Button>
          <Button size="sm" onClick={() => save('sent')} loading={saving}>
            <Send className="h-4 w-4" />
            Označit jako odesláno
          </Button>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Input
          label="Číslo faktury"
          value={form.invoice_number}
          onChange={e => set('invoice_number', e.target.value)}
        />
        <Select
          label="Měna"
          value={form.currency}
          onChange={e => set('currency', e.target.value as Currency)}
        >
          <option value="CZK">CZK – Česká koruna</option>
          <option value="EUR">EUR – Euro</option>
          <option value="USD">USD – US Dollar</option>
        </Select>
        <Input
          label="Datum vystavení"
          type="date"
          value={form.issue_date}
          onChange={e => set('issue_date', e.target.value)}
        />
        <Input
          label="Datum splatnosti"
          type="date"
          value={form.due_date}
          onChange={e => set('due_date', e.target.value)}
        />
      </div>

      {/* Sender + Client */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Dodavatel</h2>
          <Input label="Jméno / firma" value={form.sender_name} onChange={e => set('sender_name', e.target.value)} />
          <Input label="Adresa" value={form.sender_address} onChange={e => set('sender_address', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Město" value={form.sender_city} onChange={e => set('sender_city', e.target.value)} />
            <Input label="PSČ" value={form.sender_zip} onChange={e => set('sender_zip', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="IČO" value={form.sender_ico} onChange={e => set('sender_ico', e.target.value)} />
            <Input label="DIČ" value={form.sender_dic} onChange={e => set('sender_dic', e.target.value)} />
          </div>
          <Input label="Číslo účtu / IBAN" value={form.sender_bank} onChange={e => set('sender_bank', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="E-mail" type="email" value={form.sender_email} onChange={e => set('sender_email', e.target.value)} />
            <Input label="Telefon" value={form.sender_phone} onChange={e => set('sender_phone', e.target.value)} />
          </div>
        </section>

        <section className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Odběratel</h2>
          <Input label="Jméno / firma" value={form.client_name} onChange={e => set('client_name', e.target.value)} />
          <Input label="Adresa" value={form.client_address} onChange={e => set('client_address', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Město" value={form.client_city} onChange={e => set('client_city', e.target.value)} />
            <Input label="PSČ" value={form.client_zip} onChange={e => set('client_zip', e.target.value)} />
          </div>
          <Input label="IČO" value={form.client_ico} onChange={e => set('client_ico', e.target.value)} />
        </section>
      </div>

      {/* Line items */}
      <section className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Položky</h2>
          <Select
            label=""
            className="w-40"
            value={form.vat_rate}
            onChange={e => set('vat_rate', Number(e.target.value) as VatRate)}
          >
            <option value={0}>DPH 0 %</option>
            <option value={15}>DPH 15 %</option>
            <option value={21}>DPH 21 %</option>
          </Select>
        </div>

        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[1fr_80px_90px_110px_40px] gap-3 text-xs font-medium text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-100 dark:border-zinc-800">
          <span>Popis</span>
          <span>Množství</span>
          <span>Jedn.</span>
          <span className="text-right">Cena / jedn.</span>
          <span />
        </div>

        {form.items.map((item, i) => (
          <div key={i} className="grid md:grid-cols-[1fr_80px_90px_110px_40px] gap-3 items-end">
            <Input
              placeholder="Popis položky"
              value={item.description}
              onChange={e => setItem(i, 'description', e.target.value)}
            />
            <Input
              type="number"
              min={0}
              step="0.001"
              value={item.quantity}
              onChange={e => setItem(i, 'quantity', e.target.value)}
            />
            <Input
              placeholder="ks"
              value={item.unit}
              onChange={e => setItem(i, 'unit', e.target.value)}
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              className="text-right"
              value={item.unit_price}
              onChange={e => setItem(i, 'unit_price', e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={form.items.length === 1}
              className="p-2 text-zinc-400 hover:text-red-500 transition disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <Button variant="ghost" size="sm" onClick={addItem} type="button">
          <Plus className="h-4 w-4" />
          Přidat položku
        </Button>

        {/* Totals */}
        <div className="mt-4 flex flex-col items-end gap-1 text-sm">
          <div className="flex gap-8 text-zinc-600 dark:text-zinc-400">
            <span>Základ DPH</span>
            <span className="w-32 text-right font-mono">{formatCurrency(subtotal, form.currency)}</span>
          </div>
          <div className="flex gap-8 text-zinc-600 dark:text-zinc-400">
            <span>DPH ({form.vat_rate} %)</span>
            <span className="w-32 text-right font-mono">{formatCurrency(vat_amount, form.currency)}</span>
          </div>
          <div className="flex gap-8 font-bold text-zinc-900 dark:text-zinc-100 text-base border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-1">
            <span>Celkem</span>
            <span className="w-32 text-right font-mono">{formatCurrency(total, form.currency)}</span>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Poznámky
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Platební podmínky, bankovní spojení, poděkování..."
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </section>

      {/* Bottom actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="secondary" onClick={() => save('draft')} loading={saving}>
          <Save className="h-4 w-4" />
          Uložit koncept
        </Button>
        <Button onClick={() => save('sent')} loading={saving}>
          <Send className="h-4 w-4" />
          Uložit a označit jako odesláno
        </Button>
      </div>
    </div>
  )
}
