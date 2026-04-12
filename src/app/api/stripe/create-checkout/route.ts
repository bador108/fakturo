import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe, getOrCreateStripeCustomer, getPriceId } from '@/lib/stripe'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const plan: 'start' | 'pro' = body.plan === 'start' ? 'start' : 'pro'
  const billing: 'monthly' | 'annual' = body.billing === 'annual' ? 'annual' : 'monthly'

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  const customerId = await getOrCreateStripeCustomer(userId, email)
  const priceId = getPriceId(plan, billing)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { userId, plan },
  })

  return NextResponse.json({ url: session.url })
}
