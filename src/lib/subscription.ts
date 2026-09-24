import { stripe } from '@/lib/stripe'

export interface SubscriptionSummary {
  /** true = předplatné se na konci období samo obnoví a strhne další platbu */
  autoRenew: boolean
  /** konec aktuálního zaplaceného období (ISO datum) — další platba, nebo konec předplatného */
  periodEnd: string | null
  interval: 'month' | 'year' | null
}

/** Stav předplatného přímo ze Stripe (zdroj pravdy), null když žádné aktivní není. */
export async function getSubscriptionSummary(subscriptionId?: string | null): Promise<SubscriptionSummary | null> {
  if (!subscriptionId) return null
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    if (sub.status === 'canceled' || sub.status === 'incomplete_expired') return null
    const item = sub.items.data[0]
    const end = sub.cancel_at ?? item?.current_period_end
    const interval = item?.price.recurring?.interval
    return {
      autoRenew: !sub.cancel_at_period_end && !sub.cancel_at,
      periodEnd: end ? new Date(end * 1000).toISOString().slice(0, 10) : null,
      interval: interval === 'month' || interval === 'year' ? interval : null,
    }
  } catch (e) {
    console.error('[subscription] Stripe retrieve failed:', e)
    return null
  }
}

/** Zapne / vypne automatické obnovení. Vypnuté = předplatné doběhne do konce zaplaceného období. */
export async function setAutoRenew(subscriptionId: string, autoRenew: boolean): Promise<SubscriptionSummary | null> {
  if (autoRenew) {
    // zrušení mohlo přijít i jako konkrétní datum (cancel_at, např. ze Stripe portálu)
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    await stripe.subscriptions.update(subscriptionId, sub.cancel_at && !sub.cancel_at_period_end
      ? { cancel_at: '' }
      : { cancel_at_period_end: false })
  } else {
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
  }
  return getSubscriptionSummary(subscriptionId)
}
