import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { ensureUser } from '@/lib/ensureUser'
import { getUserPlan, isPaid } from '@/lib/plan'
import { inboxAddress, newInboxToken } from '@/lib/expenseInbox'

async function requirePaid() {
  const { userId } = await auth()
  if (!userId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!isPaid(await getUserPlan(userId))) {
    return { error: NextResponse.json({ error: 'Evidence výdajů je součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 }) }
  }
  return { userId }
}

// Vrátí osobní adresu pro přeposílání účtenek. Když ještě žádná není, vytvoří se.
export async function GET() {
  const { userId, error } = await requirePaid()
  if (error) return error
  await ensureUser(userId)

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('expense_inbox_token').eq('id', userId).single()
  if (user?.expense_inbox_token) return NextResponse.json({ address: inboxAddress(user.expense_inbox_token) })

  const token = newInboxToken()
  const { error: updateError } = await db.from('users').update({ expense_inbox_token: token }).eq('id', userId)
  if (updateError) return NextResponse.json({ error: 'Adresu se nepodařilo vytvořit' }, { status: 500 })
  return NextResponse.json({ address: inboxAddress(token) })
}

// Vygeneruje novou adresu a stará přestane fungovat (kdyby začala chodit nevyžádaná pošta).
export async function POST() {
  const { userId, error } = await requirePaid()
  if (error) return error
  await ensureUser(userId)

  const token = newInboxToken()
  const db = createServiceClient()
  const { error: updateError } = await db.from('users').update({ expense_inbox_token: token }).eq('id', userId)
  if (updateError) return NextResponse.json({ error: 'Adresu se nepodařilo změnit' }, { status: 500 })
  return NextResponse.json({ address: inboxAddress(token) })
}
