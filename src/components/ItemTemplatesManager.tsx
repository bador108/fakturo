'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Bookmark } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { ItemTemplate } from '@/types'

export function ItemTemplatesManager() {
  const [templates, setTemplates] = useState<ItemTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', unit: 'ks', unit_price: '' })

  useEffect(() => {
    fetch('/api/item-templates')
      .then(r => r.json())
      .then(d => setTemplates(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  function setField(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function save() {
    if (!form.name || !form.description) return
    setSaving(true)
    try {
      const res = await fetch('/api/item-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          unit: form.unit,
          unit_price: parseFloat(form.unit_price) || 0,
        }),
      })
      if (res.ok) {
        const t = await res.json()
        setTemplates(prev => [t, ...prev])
        setForm({ name: '', description: '', unit: 'ks', unit_price: '' })
        setShowForm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    await fetch(`/api/item-templates/${id}`, { method: 'DELETE' })
    setTemplates(t => t.filter(x => x.id !== id))
  }

  if (loading) return <div className="text-sm text-slate-400 py-4">Načítám…</div>

  return (
    <div className="space-y-3">
      {templates.length === 0 && !showForm && (
        <div className="text-center py-8 text-sm text-slate-400">
          <Bookmark className="h-8 w-8 text-slate-200 mx-auto mb-2" />
          Žádné šablony. Přidejte si oblíbené položky pro rychlé vyplnění faktury.
        </div>
      )}

      {templates.map(t => (
        <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
            <Bookmark className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
            <p className="text-xs text-slate-400 truncate">{t.description} · {t.unit_price} Kč/{t.unit}</p>
          </div>
          <span className="text-sm font-semibold text-slate-700 tabular-nums">
            {formatCurrency(t.unit_price, 'CZK')}
          </span>
          <button onClick={() => remove(t.id)} className="p-1.5 text-slate-300 hover:text-red-400 transition">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {showForm ? (
        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
          <p className="text-sm font-medium text-slate-700">Nová šablona</p>
          <Input label="Název šablony" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Např. Webový vývoj" />
          <Input label="Popis položky" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Popis, který se objeví na faktuře" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jednotka" value={form.unit} onChange={e => setField('unit', e.target.value)} placeholder="ks, hod, den…" />
            <Input label="Cena / jedn." type="number" value={form.unit_price} onChange={e => setField('unit_price', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} loading={saving} disabled={!form.name || !form.description}>Přidat šablonu</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Zrušit</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 border-2 border-dashed border-indigo-200 hover:border-indigo-300 rounded-xl px-4 py-3 w-full transition"
        >
          <Plus className="h-4 w-4" />
          Přidat šablonu položky
        </button>
      )}
    </div>
  )
}
