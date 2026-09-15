import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { APIError } from '@perplexity-ai/perplexity_ai'
import { ensureUser } from '@/lib/ensureUser'
import { createServiceClient } from '@/lib/supabase'
import { OWNER_EMAIL } from '@/lib/stripe'
import { askWithWebSearch, PerplexityNotConfiguredError } from '@/lib/perplexity'

export const maxDuration = 30

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureUser(userId)

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('email').eq('id', userId).single()
  if (user?.email !== OWNER_EMAIL) {
    return NextResponse.json({ error: 'Nemáte přístup k tomuto nástroji' }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { query?: string; previousResponseId?: string } | null
  if (!body?.query || typeof body.query !== 'string' || !body.query.trim()) {
    return NextResponse.json({ error: 'Chybí dotaz' }, { status: 400 })
  }

  try {
    const result = await askWithWebSearch(body.query.trim(), body.previousResponseId)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof PerplexityNotConfiguredError) {
      return NextResponse.json({ error: 'PERPLEXITY_API_KEY není nastaven na serveru' }, { status: 503 })
    }
    if (err instanceof APIError) {
      console.error('Perplexity API error:', err.status, err.message)
      return NextResponse.json({ error: `Perplexity API chyba: ${err.message}` }, { status: 502 })
    }
    console.error('Unexpected error in /api/admin/ask:', err)
    return NextResponse.json({ error: 'Neočekávaná chyba' }, { status: 500 })
  }
}
