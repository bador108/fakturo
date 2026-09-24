import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { isAppOwner, isProOverride } from '@/lib/stripe'
import { cn } from '@/lib/utils'
import { SendRemindersButton } from '@/components/SendRemindersButton'
import { CouponsPanel } from '@/components/CouponsPanel'

interface InboxMessage {
  id: string
  source: 'contact' | 'support'
  category: string
  name: string | null
  email: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'resolved'
  created_at: string
}

const sourceLabel: Record<string, string> = { contact: 'Kontakt', support: 'In-app' }

export default async function ZpravyPage() {
  const { userId } = await auth()
  if (!userId) return null

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('email').eq('id', userId).single()
  if (!isProOverride(user?.email)) redirect('/dashboard')

  const { data } = await db
    .from('inbox_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const messages = (data ?? []) as InboxMessage[]

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Zprávy</h1>
      <p className="text-sm text-slate-500 mb-4">Kontaktní formulář a in-app zpětná vazba. {messages.length} zpráv.</p>
      <div className="mb-6">
        <SendRemindersButton />
      </div>
      {isAppOwner(user?.email) && (
        <div className="mb-6">
          <CouponsPanel />
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-sm text-slate-400">
          Zatím žádné zprávy.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  m.source === 'contact' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                )}>
                  {sourceLabel[m.source] ?? m.source}
                </span>
                <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString('cs-CZ')}</span>
                {m.status === 'new' && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">Nová</span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">{m.subject}</p>
              {(m.name || m.email) && (
                <p className="text-xs text-slate-400 mb-2">{[m.name, m.email].filter(Boolean).join(' · ')}</p>
              )}
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
