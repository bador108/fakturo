import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

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
