import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'

export type Plan = 'free' | 'start' | 'pro'

export function isPro(plan: string | null | undefined): boolean {
  return plan === 'pro'
}

export function isPaid(plan: string | null | undefined): boolean {
  return plan === 'start' || plan === 'pro'
}

// Sdílené načtení efektivního plánu (řeší i vlastníka appky, co má natvrdo pro
// bez ohledu na Stripe — viz getEffectivePlan) — používají to API routy, co
// potřebují jen plán a nemají jinak žádný jiný důvod tahat users řádek.
export async function getUserPlan(userId: string): Promise<string> {
  const db = createServiceClient()
  const { data } = await db.from('users').select('plan, email').eq('id', userId).single()
  return getEffectivePlan(data?.plan ?? 'free', data?.email)
}

export const FREE_CLIENT_LIMIT = 3
