import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { listInstitutions } from '@/lib/gocardless'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const institutions = await listInstitutions('cz')
    return NextResponse.json(institutions)
  } catch (err) {
    console.error('/api/bank/institutions:', err)
    return NextResponse.json({ error: 'Nepodařilo se načíst seznam bank' }, { status: 502 })
  }
}
