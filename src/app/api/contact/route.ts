import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase'
import { notifyOwner } from '@/lib/notifyOwner'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MIN = 60

// Veřejný endpoint (kontaktní formulář, bez přihlášení) — rate-limitovaný podle IP,
// ať to nejde zneužít na spam přes support@fakturo.online.
export async function POST(req: Request) {
  const ip = getClientIp(req)
  const allowed = await checkRateLimit('contact_form_requests', ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MIN)
  if (!allowed) {
    return NextResponse.json({ error: 'Příliš mnoho zpráv, zkuste to prosím za chvíli.' }, { status: 429 })
  }

  const { jmeno, email, predmet, zprava } = await req.json().catch(() => ({}))
  if (!jmeno || !email || !predmet || !zprava) {
    return NextResponse.json({ error: 'Vyplňte prosím všechna pole.' }, { status: 400 })
  }
  if ([jmeno, email, predmet, zprava].some(v => typeof v !== 'string') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Neplatné údaje.' }, { status: 400 })
  }
  if (jmeno.length > 200 || zprava.length > 5000) {
    return NextResponse.json({ error: 'Text je příliš dlouhý.' }, { status: 400 })
  }

  const predmetLabel: Record<string, string> = {
    dotaz: 'Dotaz k produktu',
    'technicka-podpora': 'Technická podpora',
    'fakturace-platba': 'Fakturace a platba',
    spoluprace: 'Spolupráce',
    jine: 'Jiné',
  }

  const db = createServiceClient()

  const { error } = await db.from('inbox_messages').insert({
    source: 'contact',
    category: predmet,
    name: jmeno,
    email,
    subject: predmetLabel[predmet] ?? predmet,
    message: zprava,
  })

  if (error) {
    console.error('/api/contact: insert error:', error)
    return NextResponse.json({ error: 'Nepodařilo se odeslat zprávu' }, { status: 500 })
  }

  await notifyOwner(predmetLabel[predmet] ?? predmet, `${jmeno} (${email})`, zprava)

  return NextResponse.json({ success: true })
}
