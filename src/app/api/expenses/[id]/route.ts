import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const CATEGORIES = ['kancelar', 'cestovne', 'software', 'hardware', 'marketing', 'ostatni']
const CURRENCIES = ['CZK', 'EUR', 'USD']

// Úprava výdaje. Bere jen známá pole a každé zvlášť ověří, takže nejde přepsat user_id ani cestu k účtence.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Neplatná data' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if ('vendor' in body) {
    if (typeof body.vendor !== 'string' || !body.vendor.trim() || body.vendor.length > 120) return NextResponse.json({ error: 'Neplatný dodavatel' }, { status: 400 })
    update.vendor = body.vendor.trim()
  }
  if ('description' in body) {
    if (typeof body.description !== 'string' || body.description.length > 300) return NextResponse.json({ error: 'Neplatný popis' }, { status: 400 })
    update.description = body.description
  }
  if ('amount' in body) {
    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: 'Neplatná částka' }, { status: 400 })
    update.amount = amount
  }
  if ('currency' in body) {
    if (typeof body.currency !== 'string' || !CURRENCIES.includes(body.currency)) return NextResponse.json({ error: 'Neplatná měna' }, { status: 400 })
    update.currency = body.currency
  }
  if ('category' in body) {
    if (typeof body.category !== 'string' || !CATEGORIES.includes(body.category)) return NextResponse.json({ error: 'Neplatná kategorie' }, { status: 400 })
    update.category = body.category
  }
  if ('date' in body) {
    if (typeof body.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return NextResponse.json({ error: 'Neplatné datum' }, { status: 400 })
    update.date = body.date
  }
  if ('vat_claimable' in body) update.vat_claimable = Boolean(body.vat_claimable)
  if ('needs_review' in body) update.needs_review = Boolean(body.needs_review)

  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Není co měnit' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('expenses')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Výdaj nenalezen' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: expense } = await db
    .from('expenses')
    .select('receipt_url')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  const { error } = await db
    .from('expenses')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const receiptPath = expense?.receipt_url as string | null | undefined
  if (receiptPath && receiptPath.startsWith(`${userId}/`)) {
    await db.storage.from('receipts').remove([receiptPath])
  }

  return NextResponse.json({ success: true })
}
