import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getOrCreateCustomer, createConnectSession } from '@/lib/saltedge'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  try {
    const { data: user } = await db.from('users').select('bank_provider_customer_id').eq('id', userId).single()
    const customerId = await getOrCreateCustomer(userId, user?.bank_provider_customer_id)
    if (customerId !== user?.bank_provider_customer_id) {
      await db.from('users').update({ bank_provider_customer_id: customerId }).eq('id', userId)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'
    const connectUrl = await createConnectSession(customerId, `${appUrl}/api/bank/callback`)

    return NextResponse.json({ link: connectUrl })
  } catch (err) {
    console.error('/api/bank/connect:', err)
    return NextResponse.json({ error: 'Nepodařilo se propojit banku' }, { status: 502 })
  }
}
