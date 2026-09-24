import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAppOwner } from '@/lib/stripe'
import { createFreeMonthCodes, listFreeMonthCodes } from '@/lib/coupons'

// Jen pro vlastníka appky: slevové kódy "1 měsíc zdarma" ve Stripe (běží s produkčními klíči).
async function requireOwner(): Promise<NextResponse | null> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServiceClient()
  const { data: user } = await db.from('users').select('email').eq('id', userId).single()
  if (!isAppOwner(user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}

export async function GET() {
  const denied = await requireOwner()
  if (denied) return denied
  try {
    return NextResponse.json({ codes: await listFreeMonthCodes() })
  } catch (e) {
    console.error('[GET /api/admin/coupons] Error:', e)
    return NextResponse.json({ codes: [] })
  }
}

export async function POST(req: Request) {
  const denied = await requireOwner()
  if (denied) return denied

  const { count } = await req.json().catch(() => ({}))
  const n = Number.isInteger(count) && count > 0 && count <= 20 ? count : 5
  try {
    return NextResponse.json({ codes: await createFreeMonthCodes(n) })
  } catch (e) {
    console.error('[POST /api/admin/coupons] Error:', e)
    return NextResponse.json({ error: 'Kupony se nepodařilo vytvořit ve Stripe.' }, { status: 500 })
  }
}
