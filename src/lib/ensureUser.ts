import { currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'

export async function ensureUser(userId: string) {
  const db = createServiceClient()
  const { data } = await db.from('users').select('id').eq('id', userId).single()
  if (!data) {
    const u = await currentUser()
    await db.from('users').insert({
      id: userId,
      email: u?.emailAddresses[0]?.emailAddress ?? '',
      full_name: `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim(),
    })
  }
}
