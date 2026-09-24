import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { SenderProfilesManager } from '@/components/SenderProfilesManager'
import { ItemTemplatesManager } from '@/components/ItemTemplatesManager'
import { ReminderSettings } from '@/components/ReminderSettings'
import { UpgradeButton } from '@/components/UpgradeButton'
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton'
import { BankStatementUpload } from '@/components/BankStatementUpload'
import { CursorSettings } from '@/components/CursorSettings'
import { SetPasswordCard } from '@/components/SetPasswordCard'
import { ProUpsell } from '@/components/ProUpsell'
import { PohodaExportButton } from '@/components/PohodaExportButton'
import { FREE_TIER_LIMIT, getEffectivePlan } from '@/lib/stripe'
import { isPaid, isPro } from '@/lib/plan'
import { getSubscriptionSummary } from '@/lib/subscription'
import { SubscriptionSettings } from '@/components/SubscriptionSettings'
import { DEFAULT_REMINDER_DAYS, DEFAULT_REMINDER_TONE, isReminderTone } from '@/lib/reminderConfig'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const [{ data: profiles }, { data: user }] = await Promise.all([
    db.from('sender_profiles').select('*').eq('user_id', userId).order('is_default', { ascending: false }),
    db.from('users').select('plan, email, full_name, invoice_count_this_month, reminder_days, reminder_tone, stripe_subscription_id').eq('id', userId).single(),
  ])

  const plan = getEffectivePlan(user?.plan ?? 'free', user?.email)
  // stav předplatného bereme přímo ze Stripe, ať přepínač obnovení vždy sedí
  const subscription = isPaid(user?.plan) ? await getSubscriptionSummary(user?.stripe_subscription_id) : null
  const canBrand = plan === 'start' || plan === 'pro'
  const pro = isPro(plan)
  const used = user?.invoice_count_this_month ?? 0
  const reminderDays: number[] = user?.reminder_days ?? DEFAULT_REMINDER_DAYS
  const reminderTone = isReminderTone(user?.reminder_tone) ? user?.reminder_tone : DEFAULT_REMINDER_TONE
  // jméno do náhledu upomínky — výchozí profil dodavatele, jinak jméno účtu
  const reminderSender = profiles?.[0]?.name || user?.full_name || 'Vaše jméno'

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Nastavení</h1>

      <SetPasswordCard />

      {/* Plan status */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-3">Plán a předplatné</h2>
        {subscription ? (
          <SubscriptionSettings planName={plan === 'pro' ? 'Pro' : 'Start'} initial={subscription} />
        ) : plan === 'pro' ? (
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
        <SenderProfilesManager userId={userId} profiles={profiles ?? []} canBrand={canBrand} isPro={pro} />
      </div>

      {/* Item templates */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Šablony položek</h2>
        <p className="text-xs text-slate-400 mb-4">Uložte si oblíbené položky pro rychlé vyplnění faktury.</p>
        {pro ? <ItemTemplatesManager /> : (
          <ProUpsell title="Šablony položek" description="Uložte si oblíbené položky pro rychlé vyplnění faktury — součást Pro plánu." />
        )}
      </div>

      {/* Reminder settings */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Upomínky</h2>
        {pro ? <ReminderSettings initialDays={reminderDays} initialTone={reminderTone} senderName={reminderSender} /> : (
          <ProUpsell title="Automatické upomínky" description="Fakturo samo pošle klientovi upomínku před i po splatnosti — součást Pro plánu." />
        )}
      </div>

      {/* Kurzor */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Kurzor</h2>
        <p className="text-xs text-slate-400 mb-4">Nastavení platí jen pro tento prohlížeč/zařízení.</p>
        <CursorSettings />
      </div>

      {/* Bank statement upload */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Párování plateb ručně</h2>
        <p className="text-xs text-slate-400 mb-4">Nahrajte výpis z banky a faktury se automaticky označí jako zaplacené · Funguje se všemi bankami</p>
        <BankStatementUpload />
      </div>

      {/* Export dat */}
      <div className="p-5 bg-white rounded-xl border border-zinc-200">
        <h2 className="font-semibold mb-1">Export dat</h2>
        <p className="text-xs text-slate-400 mb-4">Tvoje data jsou tvoje. CSV otevřeš v Excelu, faktury v PDF stáhneš u každé faktury zvlášť.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            ['invoices', 'Faktury (CSV)', true],
            ['clients', 'Klienti (CSV)', true],
            ['expenses', 'Výdaje (CSV)', canBrand],
          ].map(([type, label, allowed]) => allowed ? (
            <a
              key={type as string}
              href={`/api/export/csv?type=${type}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              {label as string}
            </a>
          ) : null)}
        </div>
        {pro ? (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Podklady pro účetní</p>
            <PohodaExportButton />
          </div>
        ) : (
          <ProUpsell title="Export do Pohoda XML" description="Měsíční podklady pro účetní v XML pro Pohodu — součást Pro plánu." />
        )}
      </div>
    </div>
  )
}
