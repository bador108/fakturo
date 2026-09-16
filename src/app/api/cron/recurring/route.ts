import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getEffectivePlan } from '@/lib/stripe'
import { isPro } from '@/lib/plan'
import { generateInvoiceNumber, calcTotals, escapeHtml as esc } from '@/lib/utils'
import { renderInvoiceHtml } from '@/lib/invoiceHtml'
import { renderPdfFromHtml } from '@/lib/pdfBrowser'
import { Resend } from 'resend'
import QRCode from 'qrcode'
import type { RecurringInvoice } from '@/types'

export const maxDuration = 60 // víc šablon může znamenat víc PDF renderů v jednom běhu

function advanceDate(dateStr: string, recurrence: RecurringInvoice['recurrence']): string {
  const d = new Date(dateStr)
  if (recurrence === 'weekly') d.setDate(d.getDate() + 7)
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (recurrence === 'quarterly') d.setMonth(d.getMonth() + 3)
  else d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

// Generuje skutečné faktury z aktivních šablon, jejichž next_date už nastal — a to jen
// uživatelům s Pro plánem (funkce je gatovaná stejně jako její vytvoření v /api/recurring).
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)
  let generated = 0
  let skipped = 0

  const { data: due } = await db
    .from('recurring_invoices')
    .select('*')
    .eq('is_active', true)
    .lte('next_date', today)

  if (!due?.length) return NextResponse.json({ generated: 0 })

  const userIds = Array.from(new Set(due.map(r => r.user_id)))
  const { data: users } = await db.from('users').select('id, plan, email').in('id', userIds)
  const userMap = new Map((users ?? []).map(u => [u.id, u]))

  for (const template of due as RecurringInvoice[]) {
    const user = userMap.get(template.user_id)
    if (!user || !isPro(getEffectivePlan(user.plan, user.email))) {
      // Není (už) Pro — šablonu nechat ležet, next_date se posune až zase bude mít nárok.
      skipped++
      continue
    }

    try {
      const { data: lastInvoice } = await db
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', template.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const invoiceNumber = generateInvoiceNumber(lastInvoice?.invoice_number)
      const dueDate = new Date(Date.now() + template.due_days * 86400000).toISOString().slice(0, 10)
      const { subtotal, vat_amount, total } = calcTotals(template.items, template.vat_rate > 0, false)

      const { data: invoice, error: invErr } = await db
        .from('invoices')
        .insert({
          user_id: template.user_id,
          invoice_number: invoiceNumber,
          invoice_type: 'faktura',
          variable_symbol: invoiceNumber.replace(/\D/g, ''),
          status: 'sent',
          issue_date: today,
          duzp: today,
          due_date: dueDate,
          sender_name: template.sender_name,
          sender_address: template.sender_address,
          sender_city: template.sender_city,
          sender_zip: template.sender_zip,
          sender_country: template.sender_country,
          sender_ico: template.sender_ico,
          sender_dic: template.sender_dic,
          sender_bank: template.sender_bank,
          sender_iban: template.sender_iban,
          sender_email: template.sender_email,
          sender_phone: template.sender_phone,
          client_name: template.client_name,
          client_address: template.client_address,
          client_city: template.client_city,
          client_zip: template.client_zip,
          client_country: template.client_country,
          client_ico: template.client_ico,
          client_dic: template.client_dic,
          client_email: template.client_email,
          currency: template.currency,
          subtotal,
          vat_amount,
          total,
          vat_payer: template.vat_rate > 0,
          reverse_charge: false,
          notes: template.notes,
        })
        .select('*')
        .single()

      if (invErr || !invoice) throw invErr ?? new Error('Insert selhal')

      const items = template.items.map((item, i) => ({
        invoice_id: invoice.id,
        position: i,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate ?? template.vat_rate ?? 21,
      }))
      await db.from('invoice_items').insert(items)

      generated++

      // E-mail je best-effort — Resend sandbox bez ověřené domény umí poslat jen na
      // vlastníka účtu, takže reálným klientům to teď typicky selže. Selhání proto
      // nesmí zablokovat generování faktury, jen se o něm uživatel dozví v appce.
      if (template.client_email) {
        try {
          let qrCode: string | undefined
          if (template.sender_iban) {
            const iban = template.sender_iban.replace(/\s/g, '')
            const qrPayload = `SPD*1.0*ACC:${iban}*AM:${Number(total).toFixed(2)}*CC:${template.currency}*X-VS:${invoiceNumber.replace(/\D/g, '')}*MSG:Faktura ${invoiceNumber}`
            qrCode = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 })
          }
          const html = renderInvoiceHtml({ invoice, items: items as never, qrCode })
          const pdfBuffer = await renderPdfFromHtml(html)
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { error: mailErr } = await resend.emails.send({
            from: 'Fakturo <info@fakturo.online>',
            to: template.client_email,
            subject: `Faktura č. ${invoiceNumber} od ${template.sender_name}`,
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1e293b">
              <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Faktura č. ${esc(invoiceNumber)}</h2>
              <p style="color:#64748b;font-size:14px">Dobrý den, zasíláme vám pravidelnou fakturu od <strong>${esc(template.sender_name)}</strong>. Faktura je přiložena jako PDF.</p>
            </div>`,
            attachments: [{ filename: `faktura-${invoiceNumber}.pdf`, content: Buffer.from(pdfBuffer) }],
          })
          if (mailErr) throw mailErr
        } catch (mailErr) {
          console.error(`/api/cron/recurring: email selhal pro ${invoice.id}:`, mailErr)
          await db.from('notifications').insert({
            user_id: template.user_id,
            type: 'system',
            title: 'Fakturu se nepodařilo odeslat emailem',
            message: `Opakující se faktura č. ${invoiceNumber} (${template.client_name}) byla vystavena, ale automatické odeslání emailem selhalo. Odešlete ji prosím ručně.`,
            invoice_id: invoice.id,
          })
        }
      }

      await db.from('recurring_invoices').update({ next_date: advanceDate(template.next_date, template.recurrence) }).eq('id', template.id)
    } catch (err) {
      console.error(`/api/cron/recurring: šablona ${template.id} selhala:`, err)
    }
  }

  return NextResponse.json({ generated, skipped })
}
