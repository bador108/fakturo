import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json()
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Chybí zprávy' }, { status: 400 })
  }

  const db = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = today.slice(0, 7)

  const [
    { data: invoices },
    { data: expenses },
    { data: recurring },
    { data: user },
  ] = await Promise.all([
    db.from('invoices').select('invoice_number, client_name, total, currency, status, due_date, issue_date, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('expenses').select('description, amount, currency, date, category').eq('user_id', userId).order('date', { ascending: false }).limit(50),
    db.from('recurring_invoices').select('client_name, amount, currency, frequency, next_date, active').eq('user_id', userId),
    db.from('users').select('plan, invoice_count_this_month').eq('id', userId).single(),
  ])

  // Clients derived from invoices (no separate clients table)
  const clients: string[] = Array.from(new Set((invoices ?? []).map((i: { client_name: string }) => i.client_name))).filter(Boolean) as string[]

  const all = invoices ?? []
  const paid = all.filter(i => i.status === 'paid')
  const sent = all.filter(i => i.status === 'sent' && i.due_date >= today)
  const overdue = all.filter(i => i.status === 'sent' && i.due_date < today)
  const draft = all.filter(i => i.status === 'draft')
  const totalRevenue = paid.reduce((s, i) => s + Number(i.total), 0)
  const pendingAmount = sent.reduce((s, i) => s + Number(i.total), 0)
  const thisMonthInvoices = all.filter(i => i.created_at?.startsWith(thisMonth))
  const thisMonthRevenue = paid.filter(i => i.issue_date?.startsWith(thisMonth)).reduce((s, i) => s + Number(i.total), 0)
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0)

  const systemPrompt = `Jsi AI asistent přímo zabudovaný v dashboardu Fakturo. Jmenuješ se "Fakturo AI". Odpovídáš v češtině, stručně a přátelsky. Máš přístup k reálným datům tohoto uživatele.

## Data uživatele (aktuální stav k ${today})

### Plán
- Plán: ${user?.plan === 'pro' ? 'Pro (neomezené faktury)' : `Free (${user?.invoice_count_this_month ?? 0}/30 faktur tento měsíc)`}

### Faktury — přehled
- Celkem faktur: ${all.length}
- Zaplacených: ${paid.length} (příjem celkem: ${totalRevenue.toLocaleString('cs-CZ')} Kč)
- Odeslaných (čeká na platbu): ${sent.length} (${pendingAmount.toLocaleString('cs-CZ')} Kč)
- Po splatnosti: ${overdue.length}
- Konceptů: ${draft.length}
- Tento měsíc vytvořeno: ${thisMonthInvoices.length} faktur, příjem ${thisMonthRevenue.toLocaleString('cs-CZ')} Kč

### Posledních 10 faktur
${all.slice(0, 10).map(i => `- #${i.invoice_number} | ${i.client_name} | ${Number(i.total).toLocaleString('cs-CZ')} ${i.currency} | ${i.status} | splatnost ${i.due_date}`).join('\n')}

${overdue.length > 0 ? `### Po splatnosti (${overdue.length})\n${overdue.map(i => `- #${i.invoice_number} | ${i.client_name} | ${Number(i.total).toLocaleString('cs-CZ')} ${i.currency} | splatnost ${i.due_date}`).join('\n')}` : ''}

### Klienti (odvozeno z faktur)
- Celkem unikátních klientů: ${clients.length}
${clients.slice(0, 10).map(c => `- ${c}`).join('\n')}

### Výdaje
- Celkem evidovaných výdajů: ${(expenses ?? []).length}
- Celková částka: ${totalExpenses.toLocaleString('cs-CZ')} Kč
${(expenses ?? []).slice(0, 5).map(e => `- ${e.description} | ${Number(e.amount).toLocaleString('cs-CZ')} ${e.currency} | ${e.date}${e.category ? ` | ${e.category}` : ''}`).join('\n')}

### Opakující se faktury
- Celkem: ${(recurring ?? []).length}
${(recurring ?? []).map(r => `- ${r.client_name} | ${Number(r.amount).toLocaleString('cs-CZ')} ${r.currency} | ${r.frequency} | příští: ${r.next_date} | ${r.active ? 'aktivní' : 'neaktivní'}`).join('\n')}

## Funkce dashboardu
- /dashboard — přehled statistik a cashflow grafu
- /invoices — seznam faktur, filtrování
- /invoices/new — nová faktura
- /clients — správa klientů
- /expenses — evidence výdajů
- /recurring — opakující se faktury
- /finance — detailní finanční přehled
- /settings — nastavení profilu a plánu

Odpovídej na otázky o datech uživatele, pomáhej s orientací v aplikaci, navrhuj akce. Pokud se ptají na něco co nevidíš v datech, řekni to upřímně.`

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.slice(-10),
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ reply: text })
}
