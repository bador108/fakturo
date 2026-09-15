import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { generateInvoiceNumber } from '@/lib/utils'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'

export default async function NewInvoicePage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()

  // Get last invoice number to determine the next one
  const { data: lastInvoice } = await db
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = generateInvoiceNumber(lastInvoice?.invoice_number)

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
        accent_color: profile.accent_color ?? '#4F46E5',
      }
    : {}

  return (
    <InvoiceForm
      nextInvoiceNumber={nextNumber}
      defaultValues={defaultValues}
    />
  )
}
