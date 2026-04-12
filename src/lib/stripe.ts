import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const FREE_TIER_LIMIT = 30

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const { createServiceClient } = await import('@/lib/supabase')
  const db = createServiceClient()

  const { data: user } = await db
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (user?.stripe_customer_id) return user.stripe_customer_id

  const customer = await stripe.customers.create({ email, metadata: { userId } })

  await db
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer.id
}
