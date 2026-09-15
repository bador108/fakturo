import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB — logo do faktury, není důvod řešit víc
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Chybí soubor' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Podporované formáty: PNG, JPG, SVG, WEBP' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Logo může mít max. 2 MB' }, { status: 400 })
  }

  const db = createServiceClient()
  const ext = file.name.split('.').pop() ?? 'png'
  // Cesta začíná user_id, ať jde storage policy jednoduše omezit na "vlastní složku".
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await db.storage.from('logos').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadErr) {
    console.error('/api/logo/upload:', uploadErr)
    return NextResponse.json({ error: 'Nahrání loga se nezdařilo' }, { status: 500 })
  }

  const { data: publicUrl } = db.storage.from('logos').getPublicUrl(path)
  return NextResponse.json({ url: publicUrl.publicUrl })
}
