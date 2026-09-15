'use client'

import { useState, type FormEvent } from 'react'
import { useUser } from '@clerk/nextjs'
import { Loader2, KeyRound, Check } from 'lucide-react'

// Účty založené přes Google nikdy nemají heslo (passwordEnabled: false) — přihlásit se
// pak jde jen přes Google, ne přes email+heslo. user.updatePassword() bez currentPassword
// heslo prostě nastaví (Clerk to dovolí, když žádné dřív nebylo), a od té chvíle jde
// přihlásit oběma způsoby.
export function SetPasswordCard() {
  const { user, isLoaded } = useUser()
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (!isLoaded || !user || user.passwordEnabled) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await user!.updatePassword({ newPassword: password })
      setDone(true)
      setPassword('')
    } catch (err: unknown) {
      const message = (err as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0]
      setError(message?.longMessage ?? message?.message ?? 'Nepodařilo se nastavit heslo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-5 bg-white rounded-xl border border-zinc-200">
      <h2 className="font-semibold mb-1 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-slate-400" />
        Přihlašovací heslo
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Účet je zatím jen přes Google. Nastavte si heslo, ať se můžete přihlásit i bez Google účtu.
      </p>

      {done ? (
        <p className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <Check className="h-4 w-4" />
          Heslo nastaveno. Od teď se můžete přihlásit i emailem a heslem.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nové heslo"
            className="flex-1 min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Nastavit heslo
          </button>
          {error && <p className="w-full text-xs text-red-500">{error}</p>}
        </form>
      )}
    </div>
  )
}
