'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Receipt, Plus, Trash2, X, Sparkles, Camera, Paperclip, Pencil, Mail } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { readReceiptFile } from '@/lib/receiptOcr'
import { CopyButton } from '@/components/CopyButton'
import { ProUpsell } from '@/components/ProUpsell'
import type { Expense, ExpenseCategory, Currency } from '@/types'

const categories: { key: ExpenseCategory; label: string }[] = [
  { key: 'kancelar', label: 'Kancelář' },
  { key: 'cestovne', label: 'Cestovné' },
  { key: 'software', label: 'Software' },
  { key: 'hardware', label: 'Hardware' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'ostatni', label: 'Ostatní' },
]

const catColors: Record<ExpenseCategory, string> = {
  kancelar: 'bg-blue-50 text-blue-600',
  cestovne: 'bg-amber-50 text-amber-600',
  software: 'bg-purple-50 text-purple-600',
  hardware: 'bg-slate-100 text-slate-600',
  marketing: 'bg-pink-50 text-pink-600',
  ostatni: 'bg-slate-100 text-slate-500',
}

const today = new Date().toISOString().slice(0, 10)

const emptyForm = {
  date: today, vendor: '', description: '', amount: '', currency: 'CZK' as Currency,
  category: 'ostatni' as ExpenseCategory, vat_claimable: false,
}

// Fotky z mobilu mají klidně 5–12 MB — před nahráním je zmenšíme, ať je to rychlé i na datech.
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/heic' || file.type === 'image/heif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], 'uctenka.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export function ExpensesPageClient({ isPaidPlan }: { isPaidPlan: boolean }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [ocr, setOcr] = useState<{ state: 'idle' | 'reading' | 'done' | 'failed'; progress: number }>({ state: 'idle', progress: 0 })
  const ocrRun = useRef(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [quickText, setQuickText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseNote, setParseNote] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [inboxAddress, setInboxAddress] = useState<string | null>(null)

  const loadExpenses = useCallback(async (initial = false) => {
    try {
      const d = await fetch('/api/expenses').then(r => r.json())
      if (Array.isArray(d)) setExpenses(d)
    } catch {}
    if (initial) setLoading(false)
  }, [])

  useEffect(() => {
    if (!isPaidPlan) { setLoading(false); return }
    loadExpenses(true)
  }, [isPaidPlan, loadExpenses])

  // Výdaje z e-mailu přibývají na pozadí, proto se seznam obnoví při návratu na kartu a každých 20 s.
  useEffect(() => {
    if (!isPaidPlan) return
    const refresh = () => { if (document.visibilityState === 'visible') loadExpenses() }
    const timer = setInterval(refresh, 20000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [isPaidPlan, loadExpenses])

  useEffect(() => {
    if (!receiptFile || !receiptFile.type.startsWith('image/')) { setReceiptPreview(null); return }
    const url = URL.createObjectURL(receiptFile)
    setReceiptPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [receiptFile])

  useEffect(() => {
    if (!isPaidPlan) return
    fetch('/api/expenses/inbox')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.address) setInboxAddress(d.address) })
      .catch(() => {})
  }, [isPaidPlan])

  async function regenerateInbox() {
    if (!window.confirm('Stará adresa přestane fungovat. Vygenerovat novou?')) return
    const res = await fetch('/api/expenses/inbox', { method: 'POST' })
    const d = await res.json().catch(() => null)
    if (res.ok && d?.address) setInboxAddress(d.address)
  }

  function openEdit(e: Expense) {
    setEditingId(e.id)
    setForm({
      date: e.date, vendor: e.vendor ?? '', description: e.description ?? '', amount: Number(e.amount) > 0 ? String(e.amount) : '',
      currency: e.currency as Currency, category: e.category, vat_claimable: Boolean(e.vat_claimable),
    })
    setParseNote(null)
    setShowForm(true)
    // Fotku z e-mailu server nečte (OCR běží jen v prohlížeči), tak ji přečteme až tady, když výdaj někdo otevře.
    if (e.source === 'email' && e.needs_review && !(Number(e.amount) > 0) && e.receipt_url) void readStoredReceipt(e)
  }

  async function confirmExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ needs_review: false }),
    })
    if (res.ok) setExpenses(prev => prev.map(e => (e.id === id ? { ...e, needs_review: false } : e)))
  }

  function clearReceipt() {
    ocrRun.current++
    setReceiptFile(null)
    setOcr({ state: 'idle', progress: 0 })
  }

  function closeForm() {
    setShowForm(false)
    setParseNote(null)
    clearReceipt()
    if (editingId) {
      setEditingId(null)
      setForm(emptyForm)
    }
  }

  // Čtení běží přímo v prohlížeči (Tesseract) — fotka účtenky se kvůli tomu nikam neposílá.
  // Vyplní jen pole, která uživatel ještě sám nezměnil.
  async function readReceipt(file: File) {
    const run = ++ocrRun.current
    setOcr({ state: 'reading', progress: 0 })
    try {
      const p = await readReceiptFile(file, progress => {
        if (ocrRun.current === run) setOcr({ state: 'reading', progress })
      })
      if (ocrRun.current !== run) return

      setForm(f => ({
        ...f,
        vendor: f.vendor || p.vendor || '',
        amount: f.amount || (p.amount !== null ? String(p.amount) : ''),
        date: f.date === today && p.date ? p.date : f.date,
        currency: f.currency === 'CZK' ? p.currency : f.currency,
        category: f.category === 'ostatni' ? (p.category as ExpenseCategory) : f.category,
      }))
      setOcr({ state: p.amount === null && !p.vendor ? 'failed' : 'done', progress: 1 })
    } catch {
      if (ocrRun.current === run) setOcr({ state: 'failed', progress: 0 })
    }
  }

  // Stejné čtení pro fotku, která už je uložená (přišla e-mailem). Co uživatel mezitím sám změnil, se nepřepisuje;
  // dodavatel z e-mailu je jen odesílatel zprávy, takže ho nahradí ten z účtenky.
  async function readStoredReceipt(e: Expense) {
    const run = ++ocrRun.current
    setOcr({ state: 'reading', progress: 0 })
    try {
      const res = await fetch(`/api/expenses/${e.id}/receipt`)
      const blob = res.ok ? await res.blob() : null
      if (!blob || !blob.type.startsWith('image/') || /hei[cf]/.test(blob.type)) {
        if (ocrRun.current === run) setOcr({ state: 'idle', progress: 0 })
        return
      }
      const p = await readReceiptFile(new File([blob], 'uctenka', { type: blob.type }), progress => {
        if (ocrRun.current === run) setOcr({ state: 'reading', progress })
      })
      if (ocrRun.current !== run) return

      setForm(f => ({
        ...f,
        vendor: f.vendor === (e.vendor ?? '') ? (p.vendor ?? f.vendor) : f.vendor,
        amount: f.amount || (p.amount !== null ? String(p.amount) : ''),
        date: f.date === e.date && p.date ? p.date : f.date,
        currency: f.currency === e.currency ? p.currency : f.currency,
        category: f.category === 'ostatni' ? (p.category as ExpenseCategory) : f.category,
      }))
      setOcr({ state: p.amount === null && !p.vendor ? 'failed' : 'done', progress: 1 })
    } catch {
      if (ocrRun.current === run) setOcr({ state: 'failed', progress: 0 })
    }
  }

  function onReceiptPicked(file: File | null) {
    setReceiptFile(file)
    if (!file) { clearReceipt(); return }
    const readable = file.type.startsWith('image/') && file.type !== 'image/heic' && file.type !== 'image/heif'
    if (readable) void readReceipt(file)
    else setOcr({ state: 'idle', progress: 0 })
  }

  async function saveExpense() {
    if (!form.vendor || !form.amount) return
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/expenses/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, amount: Number(form.amount), needs_review: false }),
        })
        const updated = await res.json()
        if (!res.ok) {
          setParseNote(updated.error ?? 'Výdaj se nepodařilo uložit.')
          return
        }
        setExpenses(prev => prev.map(e => (e.id === editingId ? updated : e)))
        closeForm()
        return
      }

      let receiptPath: string | null = null
      if (receiptFile) {
        const fd = new FormData()
        fd.append('file', await shrinkImage(receiptFile))
        const up = await fetch('/api/expenses/receipt', { method: 'POST', body: fd })
        const upData = await up.json().catch(() => ({}))
        if (!up.ok) {
          setParseNote(upData.error ?? 'Nahrání účtenky se nezdařilo.')
          return
        }
        receiptPath = upData.path as string
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount), receipt_url: receiptPath }),
      })
      const data = await res.json()
      if (!res.ok) {
        setParseNote(data.error ?? 'Výdaj se nepodařilo uložit.')
        return
      }
      setExpenses(prev => [data, ...prev])
      closeForm()
      setForm(emptyForm)
    } finally {
      setSaving(false)
    }
  }

  async function parseQuickEntry() {
    if (!quickText.trim()) return
    setParsing(true)
    setParseNote(null)
    try {
      const res = await fetch('/api/expenses/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quickText }),
      })
      if (!res.ok) {
        setParseNote('Nepodařilo se rozpoznat, doplňte ručně.')
        setShowForm(true)
        return
      }
      const parsed = await res.json() as {
        amount: number | null; currency: Currency; date: string; category: ExpenseCategory; vendor: string; description: string
      }
      setForm({
        date: parsed.date,
        vendor: parsed.vendor,
        description: parsed.description,
        amount: parsed.amount !== null ? String(parsed.amount) : '',
        currency: parsed.currency,
        category: parsed.category,
        vat_claimable: false,
      })
      setParseNote(parsed.amount === null ? 'Částku se nepodařilo najít, doplňte ji ručně.' : null)
      setShowForm(true)
      setQuickText('')
    } finally {
      setParsing(false)
    }
  }

  async function deleteExpense(id: string) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const totalByCurrency = expenses.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] ?? 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)

  if (!isPaidPlan) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Výdaje</h1>
          <p className="text-sm text-slate-400 mt-0.5">Evidence nákladů pro daňové účely</p>
        </div>
        <ProUpsell
          title="Evidence výdajů"
          description="Zapisuj náklady, ať máš pro daně i sebe přehled co ti kolik stojí — součást Start a Pro plánu."
          minPlan="start"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Výdaje</h1>
          <p className="text-sm text-slate-400 mt-0.5">Evidence nákladů pro daňové účely</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-dark transition shadow-sm shadow-brand-soft"
        >
          <Plus className="h-4 w-4" />
          Přidat výdaj
        </button>
      </div>

      {/* E-mailem */}
      {inboxAddress && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand" />
            <p className="text-sm font-medium text-slate-700">Výdaje e-mailem</p>
          </div>
          <p className="text-xs text-slate-400">
            Přepošli sem účtenku nebo fakturu od dodavatele. PDF přečteme a výdaj se objeví v seznamu k potvrzení. Adresu můžeš uvést i jako fakturační e-mail u služeb, které platíš.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-800 break-all">{inboxAddress}</code>
            <CopyButton value={inboxAddress} label="Kopírovat" />
            <button onClick={regenerateInbox} className="text-xs text-slate-400 hover:text-slate-700 transition">Vygenerovat novou</button>
          </div>
        </div>
      )}

      {/* Quick entry */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand" />
          <p className="text-sm font-medium text-slate-700">Rychlé zadání</p>
        </div>
        <p className="text-xs text-slate-400">Vložte text z účtenky nebo e-mailu (např. &ldquo;Adobe předplatné 599 Kč včera&rdquo;) a doplníme pole za vás.</p>
        <div className="flex gap-2">
          <textarea
            value={quickText}
            onChange={e => setQuickText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                parseQuickEntry()
              }
            }}
            rows={1}
            placeholder="Adobe předplatné 599 Kč včera..."
            className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            onClick={parseQuickEntry}
            disabled={!quickText.trim() || parsing}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 font-medium shrink-0"
          >
            {parsing ? 'Zpracovávám…' : 'Rozpoznat'}
          </button>
        </div>
      </div>

      {/* Totals */}
      {expenses.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(totalByCurrency).map(([cur, total]) => (
            <div key={cur} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
              <p className="text-xs text-slate-400">Celkem výdajů ({cur})</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(total, cur as Currency)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editingId ? 'Upravit výdaj' : 'Přidat výdaj'}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {parseNote && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{parseNote}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Datum</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kategorie</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                  {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dodavatel / název</label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder="např. Adobe, Bolt, Alza..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Popis (volitelné)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Předplatné, letenka Praha-Berlín..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Částka</label>
                <input type="number" min={0} step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Měna</label>
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value as Currency }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                  <option value="CZK">CZK</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.vat_claimable} onChange={e => setForm(f => ({ ...f, vat_claimable: e.target.checked }))}
                className="rounded border-slate-300 text-brand" />
              Uplatnitelné DPH
            </label>

            {!editingId && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Účtenka (volitelné)</label>
              {receiptFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
                  {receiptPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={receiptPreview} alt="Náhled účtenky" className="h-14 w-14 rounded-md object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-md bg-slate-50 flex items-center justify-center">
                      <Paperclip className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <p className="flex-1 min-w-0 text-sm text-slate-600 truncate">{receiptFile.name}</p>
                  <button type="button" onClick={clearReceipt} className="text-slate-400 hover:text-red-400 shrink-0" aria-label="Odebrat účtenku">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition">
                  <Camera className="h-4 w-4" />
                  Vyfotit nebo nahrát účtenku
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={e => onReceiptPicked(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
            )}

            {ocr.state === 'reading' && (
              <p className="text-xs text-slate-500">
                Čtu účtenku… {ocr.progress > 0 ? `${Math.round(ocr.progress * 100)} %` : 'připravuji'}
              </p>
            )}
            {ocr.state === 'done' && (
              <p className="text-xs text-emerald-600">Údaje jsme předvyplnili z fotky, zkontroluj je prosím.</p>
            )}
            {ocr.state === 'failed' && (
              <p className="text-xs text-amber-600">Z fotky se nepodařilo nic přečíst, vyplň údaje ručně.</p>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition">Zrušit</button>
              <button onClick={saveExpense} disabled={!form.vendor || !form.amount || saving}
                className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark transition disabled:opacity-50 font-medium">
                {saving ? 'Ukládám…' : 'Uložit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Načítám…</div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Žádné výdaje</p>
            <p className="text-xs text-slate-400 mt-1">Evidujte náklady pro přehled a daně</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {expenses.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-slate-50/50 group">
                <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <Receipt className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{e.vendor}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {formatDate(e.date)}{e.description ? ` · ${e.description}` : ''}
                  </p>
                </div>
                <span className={`hidden sm:inline text-xs px-2.5 py-1 rounded-full font-medium ${catColors[e.category]}`}>
                  {categories.find(c => c.key === e.category)?.label}
                </span>
                {e.vat_claimable && (
                  <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">DPH</span>
                )}
                {e.needs_review && (
                  <button
                    onClick={() => confirmExpense(e.id)}
                    title="Z e-mailu — zkontroluj údaje a potvrď"
                    className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition shrink-0"
                  >
                    Z e-mailu · potvrdit
                  </button>
                )}
                {e.receipt_url && (
                  <a
                    href={`/api/expenses/${e.id}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Zobrazit účtenku"
                    aria-label="Zobrazit účtenku"
                    className="text-slate-400 hover:text-brand transition shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </a>
                )}
                <span className="font-semibold text-slate-800 text-sm shrink-0 text-right tabular-nums">
                  {formatCurrency(e.amount, e.currency)}
                </span>
                <button onClick={() => openEdit(e)} aria-label="Upravit výdaj" className="text-slate-300 hover:text-brand transition opacity-0 group-hover:opacity-100 shrink-0">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteExpense(e.id)} className="text-slate-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
