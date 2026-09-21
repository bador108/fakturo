import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { extractText, getDocumentProxy } from 'unpdf'
import { createServiceClient } from '@/lib/supabase'
import { getUserPlan, isPaid } from '@/lib/plan'
import { guessCategory } from '@/lib/expenseCategory'
import { htmlToText, senderName, tokenFromRecipients } from '@/lib/expenseInbox'
import { parseReceiptText } from '@/lib/receiptText'

export const maxDuration = 30

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024
const MAX_ATTACHMENTS = 4
const MAX_PER_DAY = 50
const WANTED_TYPE = /^(application\/pdf|image\/(jpeg|png|webp|heic|heif))$/i
const EXT_BY_TYPE: Record<string, string> = {
  'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif',
}

interface ReceivedEvent {
  type?: string
  created_at?: string
  data?: { email_id?: string; from?: string; to?: string[]; subject?: string; created_at?: string }
}

async function pdfToText(bytes: Uint8Array): Promise<string> {
  try {
    const pdf = await getDocumentProxy(bytes)
    const { text } = await extractText(pdf, { mergePages: true })
    return text
  } catch {
    return ''
  }
}

// Webhook od Resendu: přišel e-mail na osobní adresu uživatele (<token>@uctenky.fakturo.online).
// Z přílohy (PDF/foto) nebo textu se vytvoří výdaj označený k zkontrolování.
export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook není nastavený' }, { status: 503 })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const payload = await req.text()

  let event: ReceivedEvent
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get('svix-id') ?? '',
        timestamp: req.headers.get('svix-timestamp') ?? '',
        signature: req.headers.get('svix-signature') ?? '',
      },
      webhookSecret: secret,
    }) as ReceivedEvent
  } catch {
    return NextResponse.json({ error: 'Neplatný podpis' }, { status: 401 })
  }

  // Ostatní události i cizí adresy potvrdíme 200, ať je Resend znovu neposílá.
  if (event.type !== 'email.received' || !event.data?.email_id) return NextResponse.json({ ok: true, ignored: 'event' })
  const emailId = event.data.email_id

  const token = tokenFromRecipients(event.data.to ?? [])
  if (!token) return NextResponse.json({ ok: true, ignored: 'recipient' })

  const db = createServiceClient()
  const { data: user } = await db.from('users').select('id').eq('expense_inbox_token', token).single()
  if (!user) return NextResponse.json({ ok: true, ignored: 'unknown-token' })
  const userId = user.id as string

  if (!isPaid(await getUserPlan(userId))) return NextResponse.json({ ok: true, ignored: 'plan' })

  const { data: already } = await db.from('expenses').select('id').eq('inbound_email_id', emailId).maybeSingle()
  if (already) return NextResponse.json({ ok: true, ignored: 'duplicate' })

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await db.from('expenses').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('source', 'email').gte('created_at', since)
  if ((count ?? 0) >= MAX_PER_DAY) return NextResponse.json({ ok: true, ignored: 'rate-limit' })

  const { data: email, error: emailError } = await resend.emails.receiving.get(emailId)
  if (emailError || !email) {
    console.error('/api/inbound/expense: nepodařilo se načíst e-mail', emailError)
    return NextResponse.json({ error: 'E-mail se nepodařilo načíst' }, { status: 502 })
  }

  const { data: attachmentList } = await resend.emails.receiving.attachments.list({ emailId })
  const wanted = (attachmentList?.data ?? [])
    .filter(a => a.download_url && WANTED_TYPE.test(a.content_type ?? '') && (a.size ?? 0) <= MAX_ATTACHMENT_BYTES)
    .slice(0, MAX_ATTACHMENTS)

  let pdfText = ''
  let receipt: { bytes: Uint8Array; type: string } | null = null
  for (const att of wanted) {
    try {
      const res = await fetch(att.download_url)
      if (!res.ok) continue
      const bytes = new Uint8Array(await res.arrayBuffer())
      const type = att.content_type.toLowerCase()
      if (type === 'application/pdf') {
        pdfText += `\n${await pdfToText(bytes)}`
        if (!receipt || !receipt.type.includes('pdf')) receipt = { bytes, type }
      } else if (!receipt) {
        receipt = { bytes, type }
      }
    } catch (e) {
      console.error('/api/inbound/expense: příloha se nepodařila stáhnout', e)
    }
  }

  const subject = (email.subject ?? event.data.subject ?? '').trim()
  const from = email.from ?? event.data.from ?? ''
  const bodyText = (email.text && email.text.trim()) || (email.html ? htmlToText(email.html) : '')

  const fromPdf = pdfText.trim() ? parseReceiptText(pdfText) : null
  const fromBody = parseReceiptText(`${subject}\n${bodyText}`)
  const amountSource = fromPdf?.amount != null ? fromPdf : fromBody
  const vendor = fromPdf?.vendor ?? senderName(from)
  const date = fromPdf?.date ?? fromBody.date ?? (event.data.created_at ?? event.created_at ?? new Date().toISOString()).slice(0, 10)

  let receiptPath: string | null = null
  if (receipt) {
    const ext = EXT_BY_TYPE[receipt.type] ?? 'bin'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await db.storage.from('receipts').upload(path, receipt.bytes, { contentType: receipt.type, upsert: false })
    if (uploadError) console.error('/api/inbound/expense: nahrání účtenky selhalo', uploadError)
    else receiptPath = path
  }

  const { error: insertError } = await db.from('expenses').insert({
    user_id: userId,
    date,
    vendor: vendor.slice(0, 120),
    description: (subject || 'Výdaj z e-mailu').slice(0, 300),
    amount: amountSource.amount ?? 0,
    currency: amountSource.currency,
    category: guessCategory(`${vendor} ${subject} ${pdfText.slice(0, 2000)}`),
    vat_claimable: false,
    receipt_url: receiptPath,
    source: 'email',
    needs_review: true,
    inbound_email_id: emailId,
  })

  if (insertError) {
    // Souběžné opakování téhož webhooku — druhý pokus narazí na unikátní index a je v pořádku.
    if (insertError.code === '23505') return NextResponse.json({ ok: true, ignored: 'duplicate' })
    console.error('/api/inbound/expense: uložení výdaje selhalo', insertError)
    return NextResponse.json({ error: 'Výdaj se nepodařilo uložit' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
