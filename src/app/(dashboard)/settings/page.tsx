import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { SenderProfileForm } from '@/components/SenderProfileForm'
import { UpgradeButton } from '@/components/UpgradeButton'
import { FREE_TIER_LIMIT } from '@/lib/stripe'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const [{ data: profile }, { data: user }] = await Promise.all([
    db.from('sender_profiles').select('*').eq('user_id', userId).eq('is_default', true).single(),
    db.from('users').select('plan, invoice_count_this_month').eq('id', userId).single(),
  ])

  const plan = user?.plan ?? 'free'
  const used = user?.invoice_count_this_month ?? 0

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Nastavení</h1>

      {/* Plan status */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-3">Plán</h2>
        {plan === 'pro' ? (
          <p className="text-sm text-green-600 font-medium">✓ Pro plán aktivní – neomezené faktury</p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600">
              Free plán · {used} / {FREE_TIER_LIMIT} faktur tento měsíc
            </p>
            <UpgradeButton />
          </div>
        )}
      </div>

      {/* Default sender profile */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-4">Výchozí údaje dodavatele</h2>
        <SenderProfileForm userId={userId} profile={profile ?? undefined} />
      </div>
    </div>
  )
}
