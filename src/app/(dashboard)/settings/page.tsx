import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { SenderProfilesManager } from '@/components/SenderProfilesManager'
import { ItemTemplatesManager } from '@/components/ItemTemplatesManager'
import { ReminderSettings } from '@/components/ReminderSettings'
import { UpgradeButton } from '@/components/UpgradeButton'
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton'
import { BankStatementUpload } from '@/components/BankStatementUpload'
import { BankConnections } from '@/components/BankConnections'
import { SetPasswordCard } from '@/components/SetPasswordCard'
import { FREE_TIER_LIMIT, getEffectivePlan } from '@/lib/stripe'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const [{ data: profiles }, { data: user }, { data: bankConnections }, { data: bankAccounts }] = await Promise.all([
    db.from('sender_profiles').select('*').eq('user_id', userId).order('is_default', { ascending: false }),
    db.from('users').select('plan, email, invoice_count_this_month, reminder_days').eq('id', userId).single(),
    db.from('bank_connections').select('id, institution_name, institution_logo, status').eq('user_id', userId),
    db.from('bank_accounts').select('iban, currency, balance, display_name').eq('user_id', userId),
  ])

  const plan = getEffectivePlan(user?.plan ?? 'free', user?.email)
  const canBrand = plan === 'start' || plan === 'pro'
  const used = user?.invoice_count_this_month ?? 0
  const reminderDays: number[] = user?.reminder_days ?? [3, 7, 14]

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Nastavení</h1>

      <SetPasswordCard />

      {/* Plan status */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-3">Plán</h2>
        {plan === 'pro' ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-green-600 font-medium">✓ Pro plán aktivní – neomezené faktury + všechny funkce</p>
            <ManageSubscriptionButton />
          </div>
        ) : plan === 'start' ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-brand font-medium">✓ Start plán aktivní – neomezené faktury</p>
            <ManageSubscriptionButton />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600">
              Free plán · {used} / {FREE_TIER_LIMIT} faktur tento měsíc
            </p>
            <UpgradeButton />
          </div>
        )}
      </div>

      {/* Sender profiles */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Profily dodavatele</h2>
        <p className="text-xs text-slate-400 mb-4">Uložte údaje pro různé firmy nebo živnosti. Vybraný profil se automaticky načte do nové faktury.</p>
        <SenderProfilesManager userId={userId} profiles={profiles ?? []} canBrand={canBrand} />
      </div>

      {/* Item templates */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Šablony položek</h2>
        <p className="text-xs text-slate-400 mb-4">Uložte si oblíbené položky pro rychlé vyplnění faktury.</p>
        <ItemTemplatesManager />
      </div>

      {/* Reminder settings */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Upomínky</h2>
        <ReminderSettings userId={userId} initialDays={reminderDays} />
      </div>

      {/* Live bank sync */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Bankovní účet</h2>
        <p className="text-xs text-slate-400 mb-4">Živé propojení s bankou — zůstatek a párování plateb bez ručního nahrávání.</p>
        <Suspense fallback={null}>
          <BankConnections
            initialConnections={bankConnections ?? []}
            initialAccounts={(bankAccounts ?? []).map(a => ({
              iban: a.iban, currency: a.currency, balance: a.balance, displayName: a.display_name,
            }))}
          />
        </Suspense>
      </div>

      {/* Bank statement upload (manual fallback) */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Párování plateb ručně</h2>
        <p className="text-xs text-slate-400 mb-4">Nahrajte výpis z banky a faktury se automaticky označí jako zaplacené · Funguje se všemi bankami</p>
        <BankStatementUpload />
      </div>
    </div>
  )
}
