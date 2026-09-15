'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ClientPicker } from '@/components/ClientPicker'
import { calcTotals, formatCurrency } from '@/lib/utils'
import type { RecurringInvoice, InvoiceItemDraft, Client, SenderProfile, VatRate, Currency } from '@/types'

interface Props {
  onCreated: (r: RecurringInvoice) => void
  onCancel: () => void
}

const DEFAULT_ITEM: InvoiceItemDraft = { description: '', quantity: 1, unit: 'ks', unit_price: 0, vat_rate: 21 }

export function RecurringInvoiceForm({ onCreated, onCancel }: Props) {
  const [senderProfile, setSenderProfile] = useState<SenderProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientCity, setClientCity] = useState('')
  const [clientZip, setClientZip] = useState('')
  const [clientIco, setClientIco] = useState('')
  const [clientDic, setClientDic] = useState('')
  const [recurrence, setRecurrence] = useState<RecurringInvoice['recurrence']>('monthly')
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDays, setDueDays] = useState(14)
  const [currency, setCurrency] = useState<Currency>('CZK')
  const [vatRate, setVatRate] = useState<VatRate>(21)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InvoiceItemDraft[]>([{ ...DEFAULT_ITEM }])

  useEffect(() => {
    fetch('/api/sender-profiles')
      .then(r => r.json())
      .then((d: SenderProfile[]) => { if (Array.isArray(d)) setSenderProfile(d.find(p => p.is_default) ?? d[0] ?? null) })
      .catch(() => {})
  }, [])

  function selectClient(c: Client) {
    setClientName(c.name)
    setClientAddress(c.address ?? '')
    setClientCity(c.city ?? '')
    setClientZip(c.zip ?? '')
    setClientIco(c.ico ?? '')
    setClientDic(c.dic ?? '')
    setClientEmail(c.email ?? '')
    if (!name) setName(`Faktura pro ${c.name}`)
  }

  function setItem(i: number, field: keyof InvoiceItemDraft, value: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: field === 'description' || field === 'unit' ? value : Number(value) } : item))
  }

  const { total } = calcTotals(items, vatRate > 0, false)

  async function save() {
    if (!senderProfile) { setError('Nejdřív si v Nastavení vytvořte profil dodavatele.'); return }
    if (!clientName.trim()) { setError('Vyplňte odběratele.'); return }
    if (!items.some(i => i.description.trim())) { setError('Přidejte alespoň jednu položku.'); return }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || `Faktura pro ${clientName}`,
          recurrence,
          next_date: nextDate,
          is_active: true,
          sender_name: senderProfile.name,
          sender_address: senderProfile.address ?? '',
          sender_city: senderProfile.city ?? '',
          sender_zip: senderProfile.zip ?? '',
          sender_country: senderProfile.country,
          sender_ico: senderProfile.ico ?? '',
          sender_dic: senderProfile.dic ?? '',
          sender_bank: senderProfile.bank_account ?? '',
          sender_iban: senderProfile.iban ?? '',
          sender_email: senderProfile.email ?? '',
          sender_phone: senderProfile.phone ?? '',
          client_name: clientName,
          client_address: clientAddress,
          client_city: clientCity,
          client_zip: clientZip,
          client_country: 'CZ',
          client_ico: clientIco,
          client_dic: clientDic,
          client_email: clientEmail,
          currency,
          vat_rate: vatRate,
          notes,
          due_days: dueDays,
          items: items.filter(i => i.description.trim()),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Nepodařilo se uložit'); return }
      onCreated(data)
    } catch {
      setError('Nepodařilo se uložit.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Nová opakující se faktura</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
      </div>

      {!senderProfile && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          Nemáte žádný profil dodavatele — vytvořte si ho v Nastavení, ať má faktura odkud vzít vaše údaje.
        </p>
      )}

      <Input label="Název šablony" value={name} onChange={e => setName(e.target.value)} placeholder="Např. Měsíční support" />

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-600">Odběratel</label>
        <ClientPicker onSelect={selectClient} />
      </div>
      <Input label="Jméno / firma" value={clientName} onChange={e => setClientName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="E-mail" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
        <Input label="IČO" value={clientIco} onChange={e => setClientIco(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Adresa" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Město" value={clientCity} onChange={e => setClientCity(e.target.value)} />
          <Input label="PSČ" value={clientZip} onChange={e => setClientZip(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select label="Opakování" value={recurrence} onChange={e => setRecurrence(e.target.value as RecurringInvoice['recurrence'])}>
          <option value="weekly">Týdně</option>
          <option value="monthly">Měsíčně</option>
          <option value="quarterly">Čtvrtletně</option>
          <option value="yearly">Ročně</option>
        </Select>
        <Input label="První vystavení" type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} />
        <Input label="Splatnost (dní)" type="number" min={1} value={dueDays} onChange={e => setDueDays(Number(e.target.value))} />
        <Select label="Měna" value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
          <option value="CZK">CZK</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-600">Položky</label>
          <Select value={vatRate} onChange={e => setVatRate(Number(e.target.value) as VatRate)} className="!w-auto text-xs py-1">
            <option value={21}>DPH 21 %</option>
            <option value={12}>DPH 12 %</option>
            <option value={0}>Bez DPH</option>
          </Select>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              value={item.description}
              onChange={e => setItem(i, 'description', e.target.value)}
              placeholder="Popis položky"
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-soft"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={e => setItem(i, 'quantity', e.target.value)}
              className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand-soft"
            />
            <input
              type="number"
              value={item.unit_price}
              onChange={e => setItem(i, 'unit_price', e.target.value)}
              placeholder="Cena"
              className="w-24 text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand-soft"
            />
            {items.length > 1 && (
              <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-400 py-2">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setItems(prev => [...prev, { ...DEFAULT_ITEM, vat_rate: vatRate }])}
          className="flex items-center gap-1.5 text-xs text-brand hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Přidat položku
        </button>
      </div>

      <div className="flex justify-end text-sm">
        <span className="text-slate-400 mr-2">Celkem za fakturu:</span>
        <span className="font-semibold text-slate-800">{formatCurrency(total, currency)}</span>
      </div>

      <Input label="Poznámka (nepovinné)" value={notes} onChange={e => setNotes(e.target.value)} />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button onClick={save} loading={saving}>Vytvořit šablonu</Button>
        <Button variant="secondary" onClick={onCancel}>Zrušit</Button>
      </div>
    </div>
  )
}
