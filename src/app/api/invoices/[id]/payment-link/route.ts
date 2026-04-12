import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: invoice, error } = await db
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (error || !invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const amountCents = Math.round(Number(invoice.total) * 100)
  if (amountCents <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const currencyMap: Record<string, string> = { CZK: 'czk', EUR: 'eur', USD: 'usd' }
  const currency = currencyMap[invoice.currency] ?? 'czk'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      quantity: 1,
      price_data: {
        currency,
        unit_amount: amountCents,
        product_data: {
          name: `Faktura č. ${invoice.invoice_number}`,
          description: `Od ${invoice.sender_name}`,
        },
      },
    }],
    metadata: { invoiceId: params.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'}/invoices/${params.id}?paid=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'}/invoices/${params.id}`,
  })

  return NextResponse.json({ url: session.url })
}
