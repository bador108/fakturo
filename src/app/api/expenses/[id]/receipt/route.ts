import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: expense } = await db
    .from('expenses')
    .select('receipt_url')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  const path = expense?.receipt_url as string | null | undefined
  if (!path || !path.startsWith(`${userId}/`)) {
    return NextResponse.json({ error: 'Účtenka nenalezena' }, { status: 404 })
  }

  const { data, error } = await db.storage.from('receipts').createSignedUrl(path, 60)
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Účtenku se nepodařilo otevřít' }, { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
