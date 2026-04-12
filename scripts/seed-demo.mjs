import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env.local
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k)
)

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

const TARGET_EMAIL = 'vaclav.urbanec3@gmail.com'

// Find user by email
const { data: user, error: userErr } = await db
  .from('users')
  .select('id')
  .eq('email', TARGET_EMAIL)
  .single()

if (userErr || !user) {
  console.error('Uživatel nenalezen:', userErr?.message)
  console.log('Zkus se nejdřív přihlásit do appky jako vaclav.urbanec3@gmail.com')
  process.exit(1)
}

const userId = user.id
console.log('Nalezen uživatel:', userId)

const clients = [
  { name: 'Alza.cz a.s.', address: 'Jankovcova 1522/53', city: 'Praha', zip: '17000', ico: '27082440' },
  { name: 'ČSOB a.s.', address: 'Radlická 333/150', city: 'Praha', zip: '15057', ico: '00001350' },
  { name: 'Komerční banka a.s.', address: 'Na Příkopě 33', city: 'Praha', zip: '11407', ico: '45317054' },
  { name: 'Mall.cz s.r.o.', address: 'Vyskočilova 1461/2a', city: 'Praha', zip: '14000', ico: '26204967' },
  { name: 'Rohlík.cz s.r.o.', address: 'Plzeňská 3350/18', city: 'Praha', zip: '15000', ico: '01761086' },
  { name: 'Zonky s.r.o.', address: 'Nám. I. P. Pavlova 1789/5', city: 'Praha', zip: '12000', ico: '03662001' },
  { name: 'Storyous s.r.o.', address: 'Jankovcova 1037/49', city: 'Praha', zip: '17000', ico: '05580842' },
  { name: 'Productboard s.r.o.', address: 'Hybernská 1034/5', city: 'Praha', zip: '11000', ico: '05491415' },
  { name: 'Twisto Payments a.s.', address: 'Wenceslas Square 846/1', city: 'Praha', zip: '11000', ico: '05668952' },
  { name: 'Kiwi.com s.r.o.', address: 'Holandská 2/4', city: 'Brno', zip: '63900', ico: '02990684' },
]

const itemSets = [
  [{ description: 'Vývoj webové aplikace – React + Next.js', quantity: 40, unit: 'hod', unit_price: 1500 },
   { description: 'Code review a optimalizace výkonu', quantity: 8, unit: 'hod', unit_price: 1200 }],
  [{ description: 'Návrh UX/UI designu – mobilní aplikace', quantity: 1, unit: 'projekt', unit_price: 45000 },
   { description: 'Prototypování a testování', quantity: 12, unit: 'hod', unit_price: 1100 }],
  [{ description: 'SEO audit a optimalizace webu', quantity: 1, unit: 'ks', unit_price: 18000 },
   { description: 'Správa Google Ads kampaní', quantity: 3, unit: 'měs', unit_price: 8000 }],
  [{ description: 'Vývoj e-commerce platformy', quantity: 1, unit: 'projekt', unit_price: 120000 }],
  [{ description: 'Databázová optimalizace a migrace', quantity: 20, unit: 'hod', unit_price: 1800 },
   { description: 'Dokumentace a technická specifikace', quantity: 6, unit: 'hod', unit_price: 1200 }],
  [{ description: 'Správa cloudové infrastruktury (AWS)', quantity: 1, unit: 'měs', unit_price: 22000 },
   { description: 'Monitoring a zabezpečení', quantity: 1, unit: 'měs', unit_price: 8000 }],
  [{ description: 'Grafický manuál a brand identity', quantity: 1, unit: 'projekt', unit_price: 35000 },
   { description: 'Tvorba marketingových materiálů', quantity: 5, unit: 'ks', unit_price: 2500 }],
  [{ description: 'API integrace – platební brána', quantity: 30, unit: 'hod', unit_price: 1600 },
   { description: 'Testování a QA', quantity: 10, unit: 'hod', unit_price: 900 }],
  [{ description: 'Konzultace a technická analýza', quantity: 16, unit: 'hod', unit_price: 2000 }],
  [{ description: 'Vývoj mobilní aplikace iOS/Android', quantity: 1, unit: 'fáze', unit_price: 85000 },
   { description: 'App Store publikace a setup', quantity: 1, unit: 'ks', unit_price: 5000 }],
]

const sender = {
  sender_name: 'Jan Novák',
  sender_address: 'Václavské náměstí 1',
  sender_city: 'Praha',
  sender_zip: '11000',
  sender_country: 'CZ',
  sender_ico: '12345678',
  sender_dic: 'CZ12345678',
  sender_bank: '123456789/0800',
  sender_iban: 'CZ6508000000001234567890',
  sender_email: TARGET_EMAIL,
  sender_phone: '+420 777 123 456',
}

const statuses = ['paid', 'paid', 'paid', 'paid', 'sent', 'sent', 'paid', 'paid', 'sent', 'paid']
const vatRates = [21, 21, 21, 0, 21, 21, 21, 21, 21, 21]
const currencies = ['CZK', 'CZK', 'CZK', 'EUR', 'CZK', 'CZK', 'CZK', 'CZK', 'CZK', 'CZK']

for (let i = 0; i < 10; i++) {
  const issueDate = new Date(Date.now() - (9 - i) * 18 * 86400000)
  const dueDate = new Date(issueDate.getTime() + 14 * 86400000)

  const items = itemSets[i]
  const vatRate = vatRates[i]
  const currency = currencies[i]
  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0)
  const vatAmount = subtotal * (vatRate / 100)
  const total = subtotal + vatAmount

  const invoiceNumber = `2025${String(i + 1).padStart(4, '0')}`

  const { data: invoice, error: invErr } = await db
    .from('invoices')
    .insert({
      user_id: userId,
      invoice_number: invoiceNumber,
      invoice_type: 'faktura',
      status: statuses[i],
      ...sender,
      client_name: clients[i].name,
      client_address: clients[i].address,
      client_city: clients[i].city,
      client_zip: clients[i].zip,
      client_country: 'CZ',
      client_ico: clients[i].ico,
      client_email: `fakturace@${clients[i].name.toLowerCase().replace(/[^a-z]/g, '')}.cz`,
      issue_date: issueDate.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
      currency,
      vat_rate: vatRate,
      subtotal,
      vat_amount: vatAmount,
      total,
      notes: i % 3 === 0 ? 'Faktura vystavena dle smlouvy č. 2025/001. Děkujeme za spolupráci.' : null,
    })
    .select()
    .single()

  if (invErr) {
    console.error(`Chyba u faktury ${invoiceNumber}:`, invErr.message)
    continue
  }

  const rows = items.map((it, pos) => ({
    invoice_id: invoice.id,
    position: pos,
    description: it.description,
    quantity: it.quantity,
    unit: it.unit,
    unit_price: it.unit_price,
  }))

  const { error: itemsErr } = await db.from('invoice_items').insert(rows)
  if (itemsErr) {
    console.error(`Chyba u položek faktury ${invoiceNumber}:`, itemsErr.message)
  } else {
    console.log(`✓ Faktura ${invoiceNumber} – ${clients[i].name} – ${total.toLocaleString('cs-CZ')} ${currency} [${statuses[i]}]`)
  }
}

console.log('\nHotovo! 10 faktur vytvořeno.')
