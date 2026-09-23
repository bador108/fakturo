import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { FREE_TIER_LIMIT, getEffectivePlan } from '@/lib/stripe'
import { isPaid } from '@/lib/plan'
import { generateInvoiceNumber } from '@/lib/utils'
import type { InvoiceFormData } from '@/types'

async function ensureUser(userId: string, db: ReturnType<typeof createServiceClient>) {
  const { data: existing } = await db.from('users').select('id, plan, email, invoice_count_this_month, invoice_count_reset_at').eq('id', userId).single()
  if (existing) return existing

  // Auto-create user if missing
  const clerkUser = await currentUser()
  const { data: created, error: createErr } = await db.from('users').insert({
    id: userId,
    email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
    full_name: [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null,
  }).select().single()

  if (createErr) console.error('User create error:', createErr.message, createErr.code)
  return created
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient()
    const { data, error } = await db
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/invoices] Supabase error:', error.message, error.code, error.details)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('[GET /api/invoices] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const user = await ensureUser(userId, db)

  if (!user) return NextResponse.json({ error: 'Nepodařilo se vytvořit uživatele. Zkontroluj SUPABASE_SERVICE_ROLE_KEY ve Vercelu.' }, { status: 500 })

  // Reset counter if new month
  const lastReset = new Date(user.invoice_count_reset_at)
  const now = new Date()
  let count = user.invoice_count_this_month
  if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    count = 0
    await db.from('users').update({ invoice_count_this_month: 0, invoice_count_reset_at: now.toISOString() }).eq('id', userId)
  }

  if (getEffectivePlan(user.plan, user.email) === 'free' && count >= FREE_TIER_LIMIT) {
    return NextResponse.json(
      { error: `Dosáhli jste limitu ${FREE_TIER_LIMIT} faktur/měsíc (Free plán). Upgradujte na Start nebo Pro.`, code: 'LIMIT_REACHED' },
      { status: 403 }
    )
  }

  const body = await req.json() as InvoiceFormData & {
    subtotal: number; vat_amount: number; total: number; status: string
  }

  const effectivePlan = getEffectivePlan(user.plan, user.email)

  if (body.invoice_type === 'nabidka' && !isPaid(effectivePlan)) {
    return NextResponse.json({ error: 'Cenové nabídky jsou součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 })
  }

  if (body.currency && body.currency !== 'CZK' && !isPaid(effectivePlan)) {
    return NextResponse.json({ error: 'Fakturace v cizí měně je součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 })
  }

  const { items, ...invoiceData } = body

  // invoice_number přišel z čísla spočítaného při načtení stránky — pokud mezitím
  // vznikla jiná faktura se stejným číslem (dvojklik, dvě otevřené záložky, souběh
  // s cron generováním opakovaných faktur), insert spadne na unique constraintu.
  // Radši to vyřešit automaticky přeplánováním čísla, než uživatele poslat zpátky
  // k ručnímu opakování celého uložení.
  let invoice: Record<string, unknown> | null = null
  let invErr
  let attemptNumber = invoiceData.invoice_number
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await db
      .from('invoices')
      .insert({ ...invoiceData, invoice_number: attemptNumber, user_id: userId })
      .select()
      .single()
    invoice = result.data
    invErr = result.error
    if (!invErr) break
    if (invErr.code !== '23505') break

    const { data: lastInvoice } = await db
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    attemptNumber = generateInvoiceNumber(lastInvoice?.invoice_number)
  }

  if (invErr) {
    const isDuplicate = invErr.code === '23505'
    return NextResponse.json(
      { error: isDuplicate ? 'Toto číslo faktury už používáte.' : invErr.message, code: isDuplicate ? 'DUPLICATE_NUMBER' : undefined },
      { status: isDuplicate ? 409 : 500 }
    )
  }

  if (!invoice) return NextResponse.json({ error: 'Fakturu se nepodařilo uložit.' }, { status: 500 })

  if (items?.length) {
    const rows = items.map((item, i) => ({
      invoice_id: invoice.id,
      position: i,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      vat_rate: item.vat_rate ?? 21,
    }))
    const { error: itemsErr } = await db.from('invoice_items').insert(rows)
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })
  }

  await db.from('users').update({ invoice_count_this_month: count + 1 }).eq('id', userId)

  return NextResponse.json(invoice, { status: 201 })
}
