import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: original, error } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (error || !original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Generate next invoice number
  const { data: latest } = await db
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let nextNumber = original.invoice_number
  if (latest?.invoice_number) {
    const match = latest.invoice_number.match(/(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10) + 1
      nextNumber = latest.invoice_number.replace(/\d+$/, String(num).padStart(match[1].length, '0'))
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, invoice_items, created_at, updated_at, status, ...rest } = original

  const { data: copy, error: copyErr } = await db
    .from('invoices')
    .insert({
      ...rest,
      invoice_number: nextNumber,
      status: 'draft',
      issue_date: today,
      due_date: dueDate,
    })
    .select()
    .single()

  if (copyErr) return NextResponse.json({ error: copyErr.message }, { status: 500 })

  if (invoice_items?.length) {
    const rows = invoice_items.map((item: { description: string; quantity: number; unit: string; unit_price: number }, i: number) => ({
      invoice_id: copy.id,
      position: i,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
    }))
    await db.from('invoice_items').insert(rows)
  }

  return NextResponse.json({ id: copy.id }, { status: 201 })
}
