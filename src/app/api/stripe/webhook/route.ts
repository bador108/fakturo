import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  const db = createServiceClient()
  const obj = event.data.object as Record<string, unknown>

  switch (event.type) {
    case 'checkout.session.completed': {
      const meta = obj.metadata as Record<string, string>
      // Invoice payment
      if (meta?.invoiceId) {
        await db.from('invoices').update({ status: 'paid' }).eq('id', meta.invoiceId)
        break
      }
      // Subscription upgrade
      const subscriptionId = obj.subscription as string
      if (meta?.userId && subscriptionId) {
        const plan = meta.plan === 'start' ? 'start' : 'pro'
        await db.from('users').update({ plan, stripe_subscription_id: subscriptionId }).eq('id', meta.userId)
      }
      break
    }
    case 'customer.subscription.deleted': {
      await db.from('users').update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_subscription_id', obj.id as string)
      break
    }
    case 'customer.subscription.updated': {
      const active = (obj.status as string) === 'active' || (obj.status as string) === 'trialing'
      await db.from('users').update({ plan: active ? 'pro' : 'free' })
        .eq('stripe_subscription_id', obj.id as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}
