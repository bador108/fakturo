import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getUserPlan, isPaid } from '@/lib/plan'

const MAX_SIZE = 8 * 1024 * 1024
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isPaid(await getUserPlan(userId))) {
    return NextResponse.json({ error: 'Evidence výdajů je součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Chybí soubor' }, { status: 400 })

  const ext = EXT_BY_TYPE[file.type]
  if (!ext) return NextResponse.json({ error: 'Podporované formáty: JPG, PNG, WEBP, HEIC, PDF' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Účtenka může mít max. 8 MB' }, { status: 400 })

  // Příponu bereme z ověřeného typu, ne z názvu souboru od uživatele.
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  const db = createServiceClient()
  const { error } = await db.storage.from('receipts').upload(path, file, { contentType: file.type, upsert: false })
  if (error) {
    console.error('/api/expenses/receipt:', error)
    return NextResponse.json({ error: 'Nahrání účtenky se nezdařilo' }, { status: 500 })
  }

  return NextResponse.json({ path })
}
