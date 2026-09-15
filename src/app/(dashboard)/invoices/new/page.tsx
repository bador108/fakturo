import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { generateInvoiceNumber } from '@/lib/utils'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'

export default async function NewInvoicePage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()

  // Get last invoice number to determine the next one
  const [{ data: lastInvoice }, { data: profile }, { data: user }] = await Promise.all([
    db.from('invoices').select('invoice_number').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    db.from('sender_profiles').select('*').eq('user_id', userId).eq('is_default', true).single(),
    db.from('users').select('plan, email').eq('id', userId).single(),
  ])

  const nextNumber = generateInvoiceNumber(lastInvoice?.invoice_number)
  const isProPlan = isPro(getEffectivePlan(user?.plan ?? 'free', user?.email))

  const defaultValues = profile
    ? {
        sender_name: profile.name,
        sender_address: profile.address ?? '',
        sender_city: profile.city ?? '',
        sender_zip: profile.zip ?? '',
        sender_country: profile.country,
        sender_ico: profile.ico ?? '',
        sender_dic: profile.dic ?? '',
        sender_bank: profile.bank_account ?? '',
        sender_iban: profile.iban ?? '',
        sender_email: profile.email ?? '',
        sender_phone: profile.phone ?? '',
        sender_logo_url: profile.logo_url ?? '',
        sender_business_registry: profile.business_registry ?? '',
        sender_web: profile.web ?? '',
        accent_color: profile.accent_color ?? '#0c0c0e',
      }
    : {}

  return (
    <InvoiceForm
      nextInvoiceNumber={nextNumber}
      defaultValues={defaultValues}
      isProPlan={isProPlan}
    />
  )
}
