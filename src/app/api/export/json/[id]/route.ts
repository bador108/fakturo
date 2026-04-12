import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const [{ data: inv }, { data: items }] = await Promise.all([
    db.from('invoices').select('*').eq('id', params.id).eq('user_id', userId).single(),
    db.from('invoice_items').select('*').eq('invoice_id', params.id).order('position'),
  ])

  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payload = { ...inv, items }
  const filename = `faktura-${inv.invoice_number}.json`

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
