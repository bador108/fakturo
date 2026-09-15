import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, message, type } = await req.json()
  if (!subject || !message) return NextResponse.json({ error: 'Chybí předmět nebo zpráva' }, { status: 400 })

  const user = await currentUser()
  const userEmail = user?.emailAddresses[0]?.emailAddress

  if (!process.env.RESEND_API_KEY) {
    console.error('/api/support: RESEND_API_KEY není nastaven')
    return NextResponse.json({ error: 'Odesílání e-mailů není nakonfigurováno' }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const typeLabel =
    type === 'idea' ? 'Nápad na zlepšení' :
    type === 'feedback' ? 'Zpětná vazba' :
    'Podpora'

  try {
    const { error } = await resend.emails.send({
      // Resend can only send "from" a verified domain — fakturosupport@gmail.com can't be
      // verified (Gmail domains aren't ownable via DNS), so onboarding@resend.dev stays the
      // envelope sender. Both the "to" and "reply-to" already point at fakturosupport@gmail.com,
      // which is what actually matters: replies land in the inbox that's checked.
      from: 'Fakturka <onboarding@resend.dev>',
      to: 'fakturosupport@gmail.com',
      replyTo: userEmail ?? 'fakturosupport@gmail.com',
      subject: `[${typeLabel}] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${typeLabel}</h2>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 4px;">Předmět: <strong>${subject}</strong></p>
          ${userEmail ? `<p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px;">Od: ${userEmail}</p>` : ''}
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; font-size: 14px; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    })

    if (error) {
      console.error('/api/support: Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('/api/support: unexpected error:', err)
    return NextResponse.json({ error: 'Nepodařilo se odeslat zprávu' }, { status: 500 })
  }
}
