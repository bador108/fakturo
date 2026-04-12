import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, message, type } = await req.json()
  if (!subject || !message) return NextResponse.json({ error: 'Chybí předmět nebo zpráva' }, { status: 400 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  const typeLabel =
    type === 'idea' ? 'Nápad na zlepšení' :
    type === 'feedback' ? 'Zpětná vazba' :
    'Podpora'

  const { error } = await resend.emails.send({
    from: 'Fakturo <faktury@fakturo.cz>',
    to: 'fakturosupport@gmail.com',
    subject: `[${typeLabel}] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${typeLabel}</h2>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">Předmět: <strong>${subject}</strong></p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; font-size: 14px; white-space: pre-wrap;">${message}</div>
      </div>
    `,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
