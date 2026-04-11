import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { generateInvoiceNumber } from '@/lib/utils'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'

export default async function NewInvoicePage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()

  // Get count of all invoices to determine next number
  const { count } = await db
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const nextNumber = generateInvoiceNumber((count ?? 0) + 1)

  // Load default sender profile
  const { data: profile } = await db
    .from('sender_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()

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
      }
    : {}

  return (
    <InvoiceForm
      nextInvoiceNumber={nextNumber}
      defaultValues={defaultValues}
    />
  )
}
