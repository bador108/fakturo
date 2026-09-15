'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp, Upload, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SenderProfile } from '@/types'

interface Props {
  userId: string
  profiles: SenderProfile[]
  canBrand: boolean
}

const DEFAULT_ACCENT = '#0c0c0e'

function ProfileForm({
  profile,
  onSave,
  onDelete,
  defaultOpen = false,
  canBrand,
}: {
  profile?: SenderProfile
  onSave: (p: SenderProfile) => void
  onDelete?: () => void
  defaultOpen?: boolean
  canBrand: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    zip: profile?.zip ?? '',
    country: profile?.country ?? 'CZ',
    ico: profile?.ico ?? '',
    dic: profile?.dic ?? '',
    bank_account: profile?.bank_account ?? '',
    iban: profile?.iban ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    accent_color: profile?.accent_color ?? DEFAULT_ACCENT,
    logo_url: profile?.logo_url ?? '',
    business_registry: profile?.business_registry ?? '',
    web: profile?.web ?? '',
  })

  function set(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true)
    setLogoError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/logo/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setLogoError(data.error ?? 'Nahrání se nezdařilo'); return }
      set('logo_url', data.url)
    } catch {
      setLogoError('Nahrání se nezdařilo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const url = profile ? `/api/sender-profiles/${profile.id}` : '/api/sender-profiles'
      const method = profile ? 'PUT' : 'POST'
      const payload: Partial<typeof form> & { is_default: boolean } = { ...form, is_default: profile?.is_default ?? false }
      if (!canBrand) delete payload.accent_color
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        onSave(data)
        setSaved(true)
        if (!profile) setOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!profile || !onDelete) return
    if (!confirm('Opravdu smazat tento profil?')) return
    await fetch(`/api/sender-profiles/${profile.id}`, { method: 'DELETE' })
    onDelete()
  }

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-left"
      >
        <div>
          <p className="text-sm font-medium text-slate-800">{form.name || 'Nový profil'}</p>
          {form.ico && <p className="text-xs text-slate-400">IČO: {form.ico}</p>}
        </div>
        <div className="flex items-center gap-2">
          {profile?.is_default && (
            <span className="text-xs bg-brand-soft text-brand px-2 py-0.5 rounded-full">Výchozí</span>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-600 mb-1 block">Logo</label>
              <div className="flex items-center gap-3">
                {form.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logo_url} alt="Logo" className="h-12 max-w-[160px] object-contain border border-slate-100 rounded-lg p-1" />
                ) : (
                  <div className="h-12 w-12 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                    <Upload className="h-4 w-4" />
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-1.5 text-xs text-brand hover:underline disabled:opacity-40"
                >
                  {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {form.logo_url ? 'Změnit logo' : 'Nahrát logo'}
                </button>
                {form.logo_url && (
                  <button type="button" onClick={() => set('logo_url', '')} className="text-slate-300 hover:text-red-400">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
            </div>
            <div className="col-span-2">
              <Input label="Jméno / firma" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Input label="Adresa" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <Input label="Město" value={form.city} onChange={e => set('city', e.target.value)} />
            <Input label="PSČ" value={form.zip} onChange={e => set('zip', e.target.value)} />
            <Input label="IČO" value={form.ico} onChange={e => set('ico', e.target.value)} />
            <Input label="DIČ" value={form.dic} onChange={e => set('dic', e.target.value)} />
            <div className="col-span-2">
              <Input
                label="Zápis v obchodním rejstříku"
                placeholder="zapsaná v OR vedeném Městským soudem v Praze, sp. zn. B 12345"
                value={form.business_registry}
                onChange={e => set('business_registry', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input label="Číslo účtu / IBAN" value={form.bank_account} onChange={e => set('bank_account', e.target.value)} />
            </div>
            <Input label="E-mail" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            <Input label="Telefon" value={form.phone} onChange={e => set('phone', e.target.value)} />
            <div className="col-span-2">
              <Input label="Web" placeholder="www.firma.cz" value={form.web} onChange={e => set('web', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-600 mb-1 block">Barva faktury</label>
              {canBrand ? (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={e => set('accent_color', e.target.value)}
                    className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={form.accent_color}
                    onChange={e => set('accent_color', e.target.value)}
                    placeholder="#0c0c0e"
                    className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400">Vlastní barva faktury je součástí Start a Pro plánu. <a href="/cenik" className="text-brand hover:underline">Upgradovat</a></p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <Button onClick={save} loading={saving}>Uložit</Button>
              {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" />Uloženo</span>}
            </div>
            {profile && onDelete && !profile.is_default && (
              <button onClick={remove} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                <Trash2 className="h-3.5 w-3.5" />
                Smazat
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SenderProfilesManager({ userId, profiles: initial, canBrand }: Props) {
  const [profiles, setProfiles] = useState<SenderProfile[]>(initial)
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="space-y-3">
      {profiles.map(p => (
        <ProfileForm
          key={p.id}
          profile={p}
          canBrand={canBrand}
          onSave={updated => setProfiles(ps => ps.map(x => x.id === updated.id ? updated : x))}
          onDelete={() => setProfiles(ps => ps.filter(x => x.id !== p.id))}
        />
      ))}

      {showNew ? (
        <ProfileForm
          defaultOpen
          canBrand={canBrand}
          onSave={newProfile => {
            setProfiles(ps => [...ps, newProfile])
            setShowNew(false)
          }}
        />
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 text-sm text-brand hover:text-brand-dark border-2 border-dashed border-brand-soft hover:border-brand-soft rounded-xl px-4 py-3 w-full transition"
        >
          <Plus className="h-4 w-4" />
          Přidat profil dodavatele
        </button>
      )}
    </div>
  )
}
