import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { stripe, getOrCreateStripeCustomer, getPriceId } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

async function ensureUser(userId: string) {
  const db = createServiceClient()
  const { data } = await db.from('users').select('id').eq('id', userId).single()
  if (!data) {
    const u = await currentUser()
    await db.from('users').insert({
      id: userId,
      email: u?.emailAddresses[0]?.emailAddress ?? '',
      full_name: `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim(),
    })
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string; billing?: string }
}) {
  const { userId } = await auth()

  const plan = searchParams.plan === 'start' ? 'start' : 'pro'
  const billing = searchParams.billing === 'annual' ? 'annual' : 'monthly'

  // Not logged in → send to sign-up, then come back here
  if (!userId) {
    const returnUrl = `/checkout?plan=${plan}&billing=${billing}`
    redirect(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`)
  }

  await ensureUser(userId)

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
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    metadata: { userId, plan },
    locale: 'cs',
  })

  redirect(session.url!)
}
