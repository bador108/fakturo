'use client'

export function UpgradeButton() {
  async function upgrade() {
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
      if (!res.ok) {
        alert('Stripe není nakonfigurován. Přidej STRIPE_SECRET_KEY do prostředí.')
        return
      }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Stripe není nakonfigurován.')
    }
  }
  return (
    <button
      onClick={upgrade}
      className="text-sm bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition font-medium"
    >
      Upgrade na Pro
    </button>
  )
}
