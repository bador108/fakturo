import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createRequisition, getInstitutions } from '@/lib/gocardless'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { institutionId } = await req.json()
  if (!institutionId) return NextResponse.json({ error: 'Chybí institutionId' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fakturo-seven.vercel.app'
  const redirectUrl = `${appUrl}/api/bank/callback`
  const reference = `fakturo-${userId}-${Date.now()}`

  const requisition = await createRequisition(institutionId, redirectUrl, reference)

  // Get institution name/logo
  const institutions: { id: string; name: string; logo: string }[] = await getInstitutions('CZ')
  const institution = institutions.find((i) => i.id === institutionId)

  const db = createServiceClient()
  await db.from('bank_connections').insert({
    user_id: userId,
    institution_id: institutionId,
    institution_name: institution?.name ?? institutionId,
    institution_logo: institution?.logo ?? null,
    requisition_id: requisition.id,
    status: 'pending',
  })

  return NextResponse.json({ link: requisition.link })
}
