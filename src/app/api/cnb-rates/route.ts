import { NextResponse } from 'next/server'

// Cache rates for 4 hours
let cache: { rates: Record<string, number>; ts: number } | null = null
const CACHE_MS = 4 * 60 * 60 * 1000

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.rates)
  }

  try {
    const res = await fetch('https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt', {
      next: { revalidate: 14400 },
    })
    const text = await res.text()
    const rates: Record<string, number> = {}

    for (const line of text.split('\n').slice(2)) {
      const parts = line.split('|')
      if (parts.length < 5) continue
      const amount = parseFloat(parts[2])
      const code = parts[3]
      const rate = parseFloat(parts[4].replace(',', '.'))
      if (code && rate && amount) {
        rates[code] = rate / amount
      }
    }

    cache = { rates, ts: Date.now() }
    return NextResponse.json(rates)
  } catch {
    return NextResponse.json({ EUR: 25.2, USD: 22.8 }, { status: 200 })
  }
}
