import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

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

  if (!process.env.RESEND_API_KEY) {
    console.error('/api/contact: RESEND_API_KEY není nastaven')
    return NextResponse.json({ error: 'Odesílání zpráv není nakonfigurováno' }, { status: 503 })
  }

  const predmetLabel: Record<string, string> = {
    dotaz: 'Dotaz k produktu',
    'technicka-podpora': 'Technická podpora',
    'fakturace-platba': 'Fakturace a platba',
    spoluprace: 'Spolupráce',
    jine: 'Jiné',
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { error } = await resend.emails.send({
      from: 'Fakturo <info@fakturo.online>',
      to: 'support@fakturo.online',
      replyTo: email,
      subject: `[Kontakt] ${predmetLabel[predmet] ?? predmet}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${predmetLabel[predmet] ?? predmet}</h2>
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px;">Od: ${jmeno} (${email})</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; font-size: 14px; white-space: pre-wrap;">${zprava}</div>
        </div>
      `,
    })

    if (error) {
      console.error('/api/contact: Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('/api/contact: unexpected error:', err)
    return NextResponse.json({ error: 'Nepodařilo se odeslat zprávu' }, { status: 500 })
  }
}
