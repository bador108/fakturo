import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createRequisition, listInstitutions } from '@/lib/gocardless'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { institutionId } = await req.json() as { institutionId?: string }
  if (!institutionId) return NextResponse.json({ error: 'Chybí institutionId' }, { status: 400 })

  const db = createServiceClient()

  try {
    const institutions = await listInstitutions('cz')
    const institution = institutions.find(i => i.id === institutionId)
    if (!institution) return NextResponse.json({ error: 'Neznámá banka' }, { status: 400 })

    // Řádek nejdřív vytvořit bez requisition_id (to přijde z GoCardless o pár řádků níž),
    // ať máme stabilní UUID pro "reference" v requisition i pro ?ref= v redirect URL.
    const { data: connection, error: insertErr } = await db
      .from('bank_connections')
      .insert({
        user_id: userId,
        institution_id: institution.id,
        institution_name: institution.name,
        institution_logo: institution.logo,
        requisition_id: crypto.randomUUID(), // dočasná unikátní hodnota, přepíše se níž
        status: 'pending',
      })
      .select('id')
      .single()
    if (insertErr || !connection) throw insertErr ?? new Error('Insert selhal')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fakturo-seven.vercel.app'
    const redirectUrl = `${appUrl}/api/bank/callback?ref=${connection.id}`
    const requisition = await createRequisition(institution.id, redirectUrl, connection.id)

    await db.from('bank_connections').update({ requisition_id: requisition.id }).eq('id', connection.id)

    return NextResponse.json({ link: requisition.link })
  } catch (err) {
    console.error('/api/bank/connect:', err)
    return NextResponse.json({ error: 'Nepodařilo se propojit banku' }, { status: 502 })
  }
}
