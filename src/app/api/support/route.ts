import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { notifyOwner } from '@/lib/notifyOwner'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, message, type } = await req.json()
  if (!subject || !message || typeof subject !== 'string' || typeof message !== 'string') {
    return NextResponse.json({ error: 'Chybí předmět nebo zpráva' }, { status: 400 })
  }
  if (subject.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: 'Text je příliš dlouhý.' }, { status: 400 })
  }

  const user = await currentUser()
  const userEmail = user?.emailAddresses[0]?.emailAddress

  const typeLabel =
    type === 'idea' ? 'Nápad na zlepšení' :
    type === 'feedback' ? 'Zpětná vazba' :
    'Podpora'

  const db = createServiceClient()

  const { error } = await db.from('inbox_messages').insert({
    source: 'support',
    category: type ?? 'support',
    email: userEmail ?? null,
    user_id: userId,
    subject: `${typeLabel}: ${subject}`,
    message,
  })

  if (error) {
    console.error('/api/support: insert error:', error)
    return NextResponse.json({ error: 'Nepodařilo se odeslat zprávu' }, { status: 500 })
  }

  await notifyOwner(`${typeLabel}: ${subject}`, userEmail ?? userId, message)

  return NextResponse.json({ success: true })
}
