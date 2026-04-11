'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SenderProfile } from '@/types'

interface Props {
  userId: string
  profile?: SenderProfile
}

export function SenderProfileForm({ userId, profile }: Props) {
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

  function set(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const body = { ...form, user_id: userId, is_default: true }
      const url = profile ? `/api/sender-profiles/${profile.id}` : '/api/sender-profiles'
      const method = profile ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
      <div className="flex items-center gap-3">
        <Button onClick={save} loading={saving}>Uložit</Button>
        {saved && <span className="text-sm text-green-600 dark:text-green-400">Uloženo ✓</span>}
      </div>
    </div>
  )
}
