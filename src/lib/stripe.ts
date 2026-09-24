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

/** Jen vlastník appky (bez ručně přidělených Pro účtů) — admin akce jako generování slevových kuponů. */
export function isAppOwner(email?: string | null): boolean {
  return !!email && [OWNER_EMAIL, 'vaclav.urbanec3@gmail.com'].includes(email)
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

/** Plán podle ceny předplatného (měsíční i roční cena Start / Pro), null = neznámá cena. */
export function planFromPriceId(priceId?: string | null): 'start' | 'pro' | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_START_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_START_ANNUAL_PRICE_ID) return 'start'
  if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) return 'pro'
  return null
}

interface CheckoutOptions {
  customerId: string
  userId: string
  plan: 'start' | 'pro'
  billing: 'monthly' | 'annual'
  cancelUrl: string
}

// Vzhled platební brány: značka Fakturo místo názvu Stripe účtu, barvy a font podle webu.
// Obrázky musí být veřejně dostupné, proto vždy produkční doména (ne localhost / preview).
type CheckoutParams = NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>

const CHECKOUT_LOOK: Pick<CheckoutParams, 'branding_settings' | 'wallet_options' | 'custom_text'> = {
  branding_settings: {
    display_name: 'Fakturo',
    logo: { type: 'url', url: 'https://fakturo.online/logo.png' },
    icon: { type: 'url', url: 'https://fakturo.online/checkout-icon.png' },
    background_color: '#fafaf8',
    button_color: '#0c0c0e',
    border_style: 'rounded',
    font_family: 'be_vietnam_pro',
  },
  // bez Link tlačítka a "Uložit mé údaje" — karta, Apple Pay a Google Pay zůstávají
  wallet_options: { link: { display: 'never' } },
  custom_text: {
    submit: { message: 'Předplatné vypneš kdykoliv v Nastavení jedním přepínačem. Doběhne do konce zaplaceného období a pak už nic neplatíš.' },
  },
}

/** Stripe Checkout pro předplatné. Vrací URL platební brány. */
export async function createSubscriptionCheckout({ customerId, userId, plan, billing, cancelUrl }: CheckoutOptions): Promise<string> {
  const params: CheckoutParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: getPriceId(plan, billing), quantity: 1 }],
    // slevový kupon jde zadat jen u měsíční platby — kupon "1 měsíc zdarma" (100 % na první
    // platbu) by u roční platby dal zdarma celý rok
    allow_promotion_codes: billing === 'monthly',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    cancel_url: cancelUrl,
    metadata: { userId, plan },
    locale: 'cs',
  }
  try {
    const session = await stripe.checkout.sessions.create({ ...params, ...CHECKOUT_LOOK })
    return session.url!
  } catch (e) {
    // platba nesmí spadnout kvůli vzhledu — když Stripe úpravy vzhledu odmítne, jede se bez nich
    console.error('[checkout] look rejected, retrying without it:', e instanceof Error ? e.message : e)
    const session = await stripe.checkout.sessions.create(params)
    return session.url!
  }
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
