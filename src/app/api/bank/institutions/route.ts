import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getInstitutions } from '@/lib/gocardless'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const institutions = await getInstitutions('CZ')
  return NextResponse.json(institutions)
}
