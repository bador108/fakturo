import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ico = searchParams.get('ico')?.replace(/\s/g, '')

  if (!ico || !/^\d{6,8}$/.test(ico)) {
    return NextResponse.json({ error: 'Neplatné IČO' }, { status: 400 })
  }

  const res = await fetch(
    `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
    { headers: { Accept: 'application/json' }, next: { revalidate: 0 } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Firma nenalezena v ARESu' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()

  const ulice = [data.sidlo?.nazevUlice, data.sidlo?.cisloDomovni].filter(Boolean).join(' ')
  const psc = data.sidlo?.psc ? String(data.sidlo.psc).replace(/(\d{3})(\d{2})/, '$1 $2') : ''

  return NextResponse.json({
    name: data.obchodniJmeno ?? '',
    address: ulice,
    city: data.sidlo?.nazevObce ?? '',
    zip: psc,
    dic: data.dic ?? '',
  })
}
