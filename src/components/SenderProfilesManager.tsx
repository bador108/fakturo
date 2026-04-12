'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SenderProfile } from '@/types'

interface Props {
  userId: string
  profiles: SenderProfile[]
}

function ProfileForm({
  profile,
  onSave,
  onDelete,
  defaultOpen = false,
}: {
  profile?: SenderProfile
  onSave: (p: SenderProfile) => void
  onDelete?: () => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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
  })

  function set(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const url = profile ? `/api/sender-profiles/${profile.id}` : '/api/sender-profiles'
      const method = profile ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, is_default: profile?.is_default ?? false }),
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
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Výchozí</span>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
              <Input label="Číslo účtu / IBAN" value={form.bank_account} onChange={e => set('bank_account', e.target.value)} />
            </div>
            <Input label="E-mail" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            <Input label="Telefon" value={form.phone} onChange={e => set('phone', e.target.value)} />
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
export function SenderProfilesManager({ userId, profiles: initial }: Props) {
  const [profiles, setProfiles] = useState<SenderProfile[]>(initial)
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="space-y-3">
      {profiles.map(p => (
        <ProfileForm
          key={p.id}
          profile={p}
          onSave={updated => setProfiles(ps => ps.map(x => x.id === updated.id ? updated : x))}
          onDelete={() => setProfiles(ps => ps.filter(x => x.id !== p.id))}
        />
      ))}

      {showNew ? (
        <ProfileForm
          defaultOpen
          onSave={newProfile => {
            setProfiles(ps => [...ps, newProfile])
            setShowNew(false)
          }}
        />
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 border-2 border-dashed border-indigo-200 hover:border-indigo-300 rounded-xl px-4 py-3 w-full transition"
        >
          <Plus className="h-4 w-4" />
          Přidat profil dodavatele
        </button>
      )}
    </div>
  )
}
