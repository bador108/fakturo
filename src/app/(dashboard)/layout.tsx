import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { SupportButton } from '@/components/SupportButton'
import { BotcraftWidget } from '@/components/BotcraftWidget'
import { createServiceClient } from '@/lib/supabase'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Auto-create user in Supabase if they don't exist yet
  const db = createServiceClient()
  const { data: existing } = await db.from('users').select('id').eq('id', userId).single()
  if (!existing) {
    const clerkUser = await currentUser()
    await db.from('users').insert({
      id: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
      full_name: [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null,
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 pt-20 px-4 pb-6 md:pt-10 md:px-10 md:pb-10 overflow-auto">
        {children}
      </main>
      <SupportButton />
      <BotcraftWidget botId="add6320a-56c9-4b1d-a967-befe4e994508" />
    </div>
  )
}
