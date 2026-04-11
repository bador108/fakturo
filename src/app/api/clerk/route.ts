/**
 * Clerk webhook – syncs new users to Supabase users table.
 * Register this URL in Clerk Dashboard → Webhooks → user.created
 */
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const body = await req.text()
  const svixId = req.headers.get('svix-id') ?? ''
  const svixTs = req.headers.get('svix-timestamp') ?? ''
  const svixSig = req.headers.get('svix-signature') ?? ''

  let event: { type: string; data: Record<string, unknown> }
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET ?? '')
    event = wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTs, 'svix-signature': svixSig }) as typeof event
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'user.created') {
    const d = event.data as { id: string; email_addresses: { email_address: string }[]; first_name?: string; last_name?: string }
    const db = createServiceClient()
    await db.from('users').upsert({
      id: d.id,
      email: d.email_addresses[0]?.email_address ?? '',
      full_name: [d.first_name, d.last_name].filter(Boolean).join(' ') || null,
    })
  }

  return NextResponse.json({ ok: true })
}
