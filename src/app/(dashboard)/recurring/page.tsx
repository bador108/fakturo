import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'
import { RecurringPageClient } from '@/components/RecurringPageClient'

export default async function RecurringPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('plan, email').eq('id', userId).single()
  const isProPlan = isPro(getEffectivePlan(user?.plan ?? 'free', user?.email))

  return <RecurringPageClient isProPlan={isProPlan} />
}
