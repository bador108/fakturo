import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { setAutoRenew } from '@/lib/subscription'

// Zapnutí / vypnutí automatického obnovení předplatného — mění přímo předplatné ve Stripe,
// plán v databázi pak srovná webhook (customer.subscription.updated / deleted).
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { autoRenew } = await req.json().catch(() => ({}))
  if (typeof autoRenew !== 'boolean') {
    return NextResponse.json({ error: 'Invalid autoRenew' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('stripe_subscription_id').eq('id', userId).single()
  if (!user?.stripe_subscription_id) {
    return NextResponse.json({ error: 'Nemáš aktivní předplatné.' }, { status: 404 })
  }

  try {
    const summary = await setAutoRenew(user.stripe_subscription_id, autoRenew)
    return NextResponse.json(summary)
  } catch (e) {
    console.error('[POST /api/stripe/subscription] Error:', e)
    return NextResponse.json({ error: 'Předplatné se nepodařilo změnit.' }, { status: 500 })
  }
}
