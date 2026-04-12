import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { SupportButton } from '@/components/SupportButton'
import { DashboardChat } from '@/components/DashboardChat'
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
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
      <SupportButton />
      <DashboardChat />
    </div>
  )
}
