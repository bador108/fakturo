import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getUserPlan, isPaid } from '@/lib/plan'

type Row = (string | number | boolean | null | undefined)[]

// Excel v českém prostředí čeká středník; BOM zajistí správnou diakritiku. Buňky, které by Excel
// vyhodnotil jako vzorec (=, +, -, @), dostanou apostrof, ať se z cizího textu nespustí vzorec.
function cell(value: Row[number]): string {
  if (value === null || value === undefined) return ''
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(header: string[], rows: Row[]): string {
  return '﻿' + [header, ...rows].map(r => r.map(cell).join(';')).join('\r\n') + '\r\n'
}

const num = (n: unknown) => (n === null || n === undefined ? '' : String(Number(n)).replace('.', ','))

// Export vlastních dat uživatele (právo na přenositelnost). Faktury a klienti jsou v každém plánu,
// výdaje jsou součástí placených plánů stejně jako jejich evidence.
export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = new URL(req.url).searchParams.get('type') ?? 'invoices'
  const db = createServiceClient()
  const stamp = new Date().toISOString().slice(0, 10)
  let body: string

  if (type === 'invoices') {
    const { data } = await db.from('invoices').select('*').eq('user_id', userId).order('issue_date', { ascending: false })
    body = toCsv(
      ['Číslo', 'Typ', 'Stav', 'Datum vystavení', 'DUZP', 'Splatnost', 'Odběratel', 'IČO odběratele', 'DIČ odběratele', 'E-mail odběratele', 'Měna', 'Základ', 'DPH', 'Celkem', 'Variabilní symbol'],
      (data ?? []).map(i => [i.invoice_number, i.invoice_type, i.status, i.issue_date, i.duzp, i.due_date, i.client_name, i.client_ico, i.client_dic, i.client_email, i.currency, num(i.subtotal), num(i.vat_amount), num(i.total), i.variable_symbol]),
    )
  } else if (type === 'clients') {
    const { data } = await db.from('clients').select('*').eq('user_id', userId).order('name')
    body = toCsv(
      ['Název', 'IČO', 'DIČ', 'E-mail', 'Telefon', 'Adresa', 'Město', 'PSČ', 'Země'],
      (data ?? []).map(c => [c.name, c.ico, c.dic, c.email, c.phone, c.address, c.city, c.zip, c.country]),
    )
  } else if (type === 'expenses') {
    if (!isPaid(await getUserPlan(userId))) {
      return NextResponse.json({ error: 'Evidence výdajů je součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 })
    }
    const { data } = await db.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false })
    body = toCsv(
      ['Datum', 'Dodavatel', 'Popis', 'Kategorie', 'Částka', 'Měna', 'Uplatnitelné DPH'],
      (data ?? []).map(e => [e.date, e.vendor, e.description, e.category, num(e.amount), e.currency, e.vat_claimable ? 'ano' : 'ne']),
    )
  } else {
    return NextResponse.json({ error: 'Neznámý typ exportu' }, { status: 400 })
  }

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fakturo-${type}-${stamp}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
