import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { SupportButton } from '@/components/SupportButton'
import { createServiceClient } from '@/lib/supabase'
import { isProOverride } from '@/lib/stripe'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Auto-create user in Supabase if they don't exist yet
  const db = createServiceClient()
  const { data: existing } = await db.from('users').select('id, email').eq('id', userId).single()
  let email = existing?.email
  if (!existing) {
    const clerkUser = await currentUser()
    email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
    await db.from('users').insert({
      id: userId,
      email,
      full_name: [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null,
    })
  }

  return (
    <div className="flex h-dvh md:overflow-hidden bg-paper">
      <Sidebar isOwner={isProOverride(email)} />
      <main className="flex-1 pt-14 px-4 pb-6 md:pt-10 md:px-10 md:pb-10 overflow-auto">
        {children}
      </main>
      <SupportButton />
    </div>
  )
}
