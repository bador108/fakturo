import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const OWNER_EMAIL = 'vaclav.urbanec2@gmail.com'

// Emaily s natvrdo přiděleným Pro plánem bez ohledu na Stripe (vlastník appky +
// ručně přidělené účty). Funguje i pro email, co se ještě nikdy nezaregistroval —
// jakmile se přihlásí, ensureUser() mu založí řádek v `users`, ale getEffectivePlan()
// stejně vrátí 'pro', protože kontrola jede přes email, ne přes uloženou hodnotu plan.
const PRO_OVERRIDE_EMAILS = [OWNER_EMAIL, 'jirizahradka95@gmail.com', 'vaclav.urbanec3@gmail.com']

export function isProOverride(email?: string | null): boolean {
  return !!email && PRO_OVERRIDE_EMAILS.includes(email)
}

/** Vlastník a ručně přidělené účty mají vždy pro plán bez ohledu na Stripe */
export function getEffectivePlan(plan: string, email?: string | null): string {
  if (isProOverride(email)) return 'pro'
  return plan
}

export const FREE_TIER_LIMIT = 5
export const START_TIER_LIMIT = 999999 // unlimited in practice

export function getPriceId(plan: 'start' | 'pro', billing: 'monthly' | 'annual'): string {
  if (plan === 'start') {
    return billing === 'annual'
      ? process.env.STRIPE_START_ANNUAL_PRICE_ID!
      : process.env.STRIPE_START_MONTHLY_PRICE_ID!
  }
  return billing === 'annual'
    ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID!
    : process.env.STRIPE_PRO_MONTHLY_PRICE_ID!
}

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
