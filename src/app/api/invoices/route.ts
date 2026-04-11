import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { FREE_TIER_LIMIT } from '@/lib/stripe'
import type { InvoiceFormData } from '@/types'

async function ensureUser(userId: string, db: ReturnType<typeof createServiceClient>) {
  const { data: existing } = await db.from('users').select('id, plan, invoice_count_this_month, invoice_count_reset_at').eq('id', userId).single()
  if (existing) return existing

  // Auto-create user if missing
  const clerkUser = await currentUser()
  const { data: created } = await db.from('users').insert({
    id: userId,
    email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
    full_name: [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null,
  }).select().single()

  return created
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const user = await ensureUser(userId, db)

  if (!user) return NextResponse.json({ error: 'Nepodařilo se vytvořit uživatele.' }, { status: 500 })

  // Reset counter if new month
  const lastReset = new Date(user.invoice_count_reset_at)
  const now = new Date()
  let count = user.invoice_count_this_month
  if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    count = 0
    await db.from('users').update({ invoice_count_this_month: 0, invoice_count_reset_at: now.toISOString() }).eq('id', userId)
  }

  if (user.plan === 'free' && count >= FREE_TIER_LIMIT) {
    return NextResponse.json(
      { error: `Dosáhli jste limitu ${FREE_TIER_LIMIT} faktur/měsíc (Free plán). Upgradujte na Pro.`, code: 'LIMIT_REACHED' },
      { status: 403 }
    )
  }

  const body = await req.json() as InvoiceFormData & {
    subtotal: number; vat_amount: number; total: number; status: string
  }

  const { items, ...invoiceData } = body

  const { data: invoice, error: invErr } = await db
    .from('invoices')
    .insert({ ...invoiceData, user_id: userId })
    .select()
    .single()

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 })

  if (items?.length) {
    const rows = items.map((item, i) => ({
      invoice_id: invoice.id,
      position: i,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
    }))
    const { error: itemsErr } = await db.from('invoice_items').insert(rows)
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })
  }

  await db.from('users').update({ invoice_count_this_month: count + 1 }).eq('id', userId)

  return NextResponse.json(invoice, { status: 201 })
}
