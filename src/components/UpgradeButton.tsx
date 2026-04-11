'use client'

export function UpgradeButton() {
  async function upgrade() {
    const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
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
