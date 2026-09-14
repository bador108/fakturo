import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import type { Currency, Invoice, InvoiceItem } from '@/types'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const { data, error } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (error || !data) notFound()

  const invoice = data as Invoice & { invoice_items: InvoiceItem[] }

  const defaultValues = {
    invoice_type: invoice.invoice_type,
    sender_name: invoice.sender_name,
    sender_address: invoice.sender_address ?? '',
    sender_city: invoice.sender_city ?? '',
    sender_zip: invoice.sender_zip ?? '',
    sender_country: invoice.sender_country,
    sender_ico: invoice.sender_ico ?? '',
    sender_dic: invoice.sender_dic ?? '',
    sender_bank: invoice.sender_bank ?? '',
    sender_iban: invoice.sender_iban ?? '',
    sender_email: invoice.sender_email ?? '',
    sender_phone: invoice.sender_phone ?? '',
    client_name: invoice.client_name,
    client_address: invoice.client_address ?? '',
    client_city: invoice.client_city ?? '',
    client_zip: invoice.client_zip ?? '',
    client_country: invoice.client_country,
    client_ico: invoice.client_ico ?? '',
    client_dic: invoice.client_dic ?? '',
    client_email: invoice.client_email ?? '',
    invoice_number: invoice.invoice_number,
    issue_date: invoice.issue_date,
    duzp: invoice.duzp ?? invoice.issue_date,
    due_date: invoice.due_date,
    variable_symbol: invoice.variable_symbol ?? '',
    payment_method: invoice.payment_method ?? 'bank_transfer',
    currency: invoice.currency as Currency,
    vat_payer: invoice.vat_payer,
    reverse_charge: invoice.reverse_charge,
    notes: invoice.notes ?? '',
    items: invoice.invoice_items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      vat_rate: item.vat_rate ?? 21,
    })),
  }

  return (
    <InvoiceForm
      invoiceId={invoice.id}
      nextInvoiceNumber={invoice.invoice_number}
      defaultValues={defaultValues}
    />
  )
}
