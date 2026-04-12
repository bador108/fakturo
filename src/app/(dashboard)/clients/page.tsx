import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { ClientsManager } from '@/components/ClientsManager'
import type { Client } from '@/types'

export default async function ClientsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const { data } = await db
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  return <ClientsManager initialClients={(data ?? []) as Client[]} />
}
