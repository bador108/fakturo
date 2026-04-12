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

const { data: user } = await db.from('users').select('id').eq('email', TARGET_EMAIL).single()
if (!user) { console.error('Uživatel nenalezen'); process.exit(1) }
const userId = user.id
console.log('Uživatel:', userId)

// ── VÝDAJE ────────────────────────────────────────────────────────
const expenses = [
  { vendor: 'Adobe Creative Cloud', description: 'Měsíční předplatné', amount: 1399, category: 'software', vat_claimable: true, days_ago: 5 },
  { vendor: 'GitHub Copilot', description: 'AI asistent pro vývoj', amount: 529, category: 'software', vat_claimable: true, days_ago: 5 },
  { vendor: 'Notion', description: 'Pro předplatné', amount: 320, category: 'software', vat_claimable: true, days_ago: 8 },
  { vendor: 'Alza.cz', description: 'Mechanická klávesnice Keychron K3', amount: 3490, category: 'hardware', vat_claimable: true, days_ago: 12 },
  { vendor: 'Bolt', description: 'Taxi Praha Centrum – Letiště', amount: 650, category: 'cestovne', vat_claimable: false, days_ago: 15 },
  { vendor: 'Regus', description: 'Coworking prostor – duben', amount: 4200, category: 'kancelar', vat_claimable: true, days_ago: 20 },
  { vendor: 'Google Ads', description: 'PPC kampaň – fakturo.cz', amount: 8500, category: 'marketing', vat_claimable: true, days_ago: 22 },
  { vendor: 'ČD', description: 'Vlak Praha–Brno (zpáteční)', amount: 890, category: 'cestovne', vat_claimable: false, days_ago: 28 },
  { vendor: 'Figma', description: 'Professional plán', amount: 750, category: 'software', vat_claimable: true, days_ago: 35 },
  { vendor: 'Alza.cz', description: 'Monitor LG 27" 4K', amount: 12990, category: 'hardware', vat_claimable: true, days_ago: 38 },
  { vendor: 'Vodafone', description: 'Firemní tarif – duben', amount: 599, category: 'ostatni', vat_claimable: true, days_ago: 40 },
  { vendor: 'Regus', description: 'Coworking prostor – březen', amount: 4200, category: 'kancelar', vat_claimable: true, days_ago: 52 },
  { vendor: 'Adobe Creative Cloud', description: 'Měsíční předplatné', amount: 1399, category: 'software', vat_claimable: true, days_ago: 35 },
  { vendor: 'Meta Ads', description: 'Reklama – LinkedIn + Instagram', amount: 5200, category: 'marketing', vat_claimable: true, days_ago: 55 },
  { vendor: 'Starbucks', description: 'Pracovní schůzky – březen', amount: 1240, category: 'ostatni', vat_claimable: false, days_ago: 58 },
  { vendor: 'Vercel Pro', description: 'Hosting – měsíční', amount: 500, category: 'software', vat_claimable: true, days_ago: 65 },
  { vendor: 'Supabase', description: 'Pro plán – databáze', amount: 600, category: 'software', vat_claimable: true, days_ago: 65 },
  { vendor: 'Bolt', description: 'Taxi na klientskou schůzku', amount: 380, category: 'cestovne', vat_claimable: false, days_ago: 70 },
]

for (const e of expenses) {
  const date = new Date(Date.now() - e.days_ago * 86400000).toISOString().slice(0, 10)
  const { error } = await db.from('expenses').insert({
    user_id: userId,
    date,
    vendor: e.vendor,
    description: e.description,
    amount: e.amount,
    currency: 'CZK',
    category: e.category,
    vat_claimable: e.vat_claimable,
    receipt_url: null,
  })
  if (error) console.error(`Chyba výdaj ${e.vendor}:`, error.message)
  else console.log(`✓ Výdaj: ${e.vendor} – ${e.amount} Kč`)
}

// ── OPAKUJÍCÍ SE FAKTURY ──────────────────────────────────────────
const sender = {
  sender_name: 'Jan Novák', sender_address: 'Václavské náměstí 1', sender_city: 'Praha',
  sender_zip: '11000', sender_country: 'CZ', sender_ico: '12345678', sender_dic: 'CZ12345678',
  sender_bank: '123456789/0800', sender_iban: 'CZ6508000000001234567890',
  sender_email: TARGET_EMAIL, sender_phone: '+420 777 123 456',
}

const recurring = [
  {
    name: 'Správa webu – Alza.cz',
    recurrence: 'monthly',
    next_date: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10),
    is_active: true,
    client_name: 'Alza.cz a.s.', client_address: 'Jankovcova 1522/53', client_city: 'Praha',
    client_zip: '17000', client_country: 'CZ', client_ico: '27082440',
    currency: 'CZK', vat_rate: 21, notes: 'Měsíční paušál za správu a aktualizace webu.', due_days: 14,
    items: [{ description: 'Správa a aktualizace webu', quantity: 1, unit: 'měs', unit_price: 15000 }],
  },
  {
    name: 'Hosting & DevOps – Kiwi.com',
    recurrence: 'monthly',
    next_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    is_active: true,
    client_name: 'Kiwi.com s.r.o.', client_address: 'Holandská 2/4', client_city: 'Brno',
    client_zip: '63900', client_country: 'CZ', client_ico: '02990684',
    currency: 'EUR', vat_rate: 21, notes: null, due_days: 30,
    items: [
      { description: 'Správa cloudové infrastruktury', quantity: 1, unit: 'měs', unit_price: 800 },
      { description: 'Monitoring a podpora 24/7', quantity: 1, unit: 'měs', unit_price: 300 },
    ],
  },
  {
    name: 'SEO retainer – Rohlík.cz',
    recurrence: 'monthly',
    next_date: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
    is_active: true,
    client_name: 'Rohlík.cz s.r.o.', client_address: 'Plzeňská 3350/18', client_city: 'Praha',
    client_zip: '15000', client_country: 'CZ', client_ico: '01761086',
    currency: 'CZK', vat_rate: 21, notes: null, due_days: 14,
    items: [{ description: 'SEO optimalizace a správa obsahu', quantity: 1, unit: 'měs', unit_price: 18000 }],
  },
  {
    name: 'Čtvrtletní audit – ČSOB',
    recurrence: 'quarterly',
    next_date: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    is_active: true,
    client_name: 'ČSOB a.s.', client_address: 'Radlická 333/150', client_city: 'Praha',
    client_zip: '15057', client_country: 'CZ', client_ico: '00001350',
    currency: 'CZK', vat_rate: 21, notes: 'Čtvrtletní bezpečnostní audit systémů.', due_days: 21,
    items: [
      { description: 'Bezpečnostní audit aplikací', quantity: 1, unit: 'audit', unit_price: 55000 },
      { description: 'Závěrečná zpráva a doporučení', quantity: 1, unit: 'ks', unit_price: 8000 },
    ],
  },
  {
    name: 'Roční licence – Productboard',
    recurrence: 'yearly',
    next_date: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    is_active: false,
    client_name: 'Productboard s.r.o.', client_address: 'Hybernská 1034/5', client_city: 'Praha',
    client_zip: '11000', client_country: 'CZ', client_ico: '05491415',
    currency: 'CZK', vat_rate: 0, notes: 'Roční licence za software.', due_days: 30,
    items: [{ description: 'Roční softwarová licence', quantity: 1, unit: 'rok', unit_price: 48000 }],
  },
]

for (const r of recurring) {
  const { items, ...rest } = r
  const { error } = await db.from('recurring_invoices').insert({
    user_id: userId,
    ...rest,
    ...sender,
    items: JSON.stringify(items),
  })
  if (error) console.error(`Chyba recurring ${r.name}:`, error.message)
  else console.log(`✓ Opakující se: ${r.name} (${r.recurrence})`)
}

console.log('\nHotovo!')
