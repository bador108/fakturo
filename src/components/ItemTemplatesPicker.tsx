'use client'

import { useState, useEffect } from 'react'
import { Bookmark, Plus, Trash2, X, Check } from 'lucide-react'
import type { ItemTemplate, InvoiceItemDraft } from '@/types'

interface Props {
  onAdd: (item: InvoiceItemDraft) => void
  currentItems?: InvoiceItemDraft[]
}

export function ItemTemplatesPicker({ onAdd, currentItems }: Props) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<ItemTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveForm, setSaveForm] = useState({ name: '', description: '', unit: 'ks', unit_price: '' })

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/item-templates')
      .then(r => r.json())
      .then(d => setTemplates(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [open])

  async function deleteTemplate(id: string) {
    await fetch(`/api/item-templates/${id}`, { method: 'DELETE' })
    setTemplates(t => t.filter(x => x.id !== id))
  }

  async function saveTemplate() {
    if (!saveForm.name || !saveForm.description) return
    setSaving(true)
    try {
      const res = await fetch('/api/item-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveForm.name,
          description: saveForm.description,
          unit: saveForm.unit,
          unit_price: parseFloat(saveForm.unit_price) || 0,
        }),
      })
      if (res.ok) {
        const t = await res.json()
        setTemplates(prev => [t, ...prev])
        setSaveForm({ name: '', description: '', unit: 'ks', unit_price: '' })
        setShowSaveForm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1.5 transition"
      >
        <Bookmark className="h-3.5 w-3.5" />
        Šablony
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Šablony položek</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-400">Načítám…</div>
              ) : templates.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  <Bookmark className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  Žádné šablony. Přidejte si oblíbené položky.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {templates.map(t => (
                    <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
                        <p className="text-xs text-slate-400 truncate">{t.description} · {t.unit_price} Kč/{t.unit}</p>
                      </div>
                      <button
                        onClick={() => {
                          onAdd({ description: t.description, quantity: 1, unit: t.unit, unit_price: t.unit_price })
                          setOpen(false)
                        }}
                        className="h-7 w-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(t.id)}
                        className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save current items as templates */}
            {currentItems && currentItems.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                {!showSaveForm ? (
                  <button
                    onClick={() => {
                      if (currentItems[0]) {
                        setSaveForm({
                          name: currentItems[0].description.slice(0, 30) || 'Nová šablona',
                          description: currentItems[0].description,
                          unit: currentItems[0].unit,
                          unit_price: String(currentItems[0].unit_price),
                        })
                      }
                      setShowSaveForm(true)
                    }}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    + Uložit první položku jako šablonu
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-600">Uložit jako šablonu</p>
                    <input
                      placeholder="Název šablony"
                      value={saveForm.name}
                      onChange={e => setSaveForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveTemplate}
                        disabled={saving || !saveForm.name}
                        className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg"
                      >
                        <Check className="h-3 w-3" />
                        {saving ? 'Ukládám…' : 'Uložit'}
                      </button>
                      <button onClick={() => setShowSaveForm(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2">
                        Zrušit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="px-5 py-3 border-t border-slate-100">
              <button onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:text-slate-600 w-full text-center">
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
