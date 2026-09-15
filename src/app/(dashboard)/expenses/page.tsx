import { auth } from '@clerk/nextjs/server'
import { getUserPlan, isPaid } from '@/lib/plan'
import { ExpensesPageClient } from '@/components/ExpensesPageClient'

export default async function ExpensesPage() {
  const { userId } = await auth()
  if (!userId) return null

  const plan = await getUserPlan(userId)
  return <ExpensesPageClient isPaidPlan={isPaid(plan)} />
}
