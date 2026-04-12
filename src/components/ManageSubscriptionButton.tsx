'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function open() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      if (!res.ok) {
        alert('Nepodařilo se otevřít portál. Zkontroluj konfiguraci Stripe.')
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      alert('Chyba při připojení ke Stripe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={open}
      disabled={loading}
      className="flex items-center gap-2 text-sm border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      Spravovat předplatné
    </button>
  )
}
