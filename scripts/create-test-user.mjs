import { createClerkClient } from '@clerk/backend'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Vytvoří testovací účet (username/heslo) + nastaví mu nejvyšší (pro) plán v Supabase.
//
// DŮLEŽITÉ: Clerk musí mít v Dashboard → Configure → Email, Phone, Username povolený
// identifikátor "Username" (nejen Email), jinak se přes SignIn widget nepůjde přihlásit
// pouhým "test" — Clerk API uživatele s username vytvoří i tak, ale přihlašovací formulář
// respektuje jen identifikátory zapnuté v Dashboardu.
//
// Heslo se NIKDY nepíše natvrdo do repa — dej ho jako env proměnnou při spuštění:
//   TEST_USER_PASSWORD='...' node scripts/create-test-user.mjs
// (potřebuje taky .env.local s reálnými Clerk/Supabase klíči)

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k)
)

const TEST_USERNAME = 'test'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD
// Reálná, aktivně kontrolovaná schránka — appka má 2FA přes email kód zapnuté
// instančně, takže fallback email MUSÍ být doručitelný, jinak se na "test" nikdo nepřihlásí.
const TEST_EMAIL = 'fakturosupport@gmail.com'

if (!TEST_PASSWORD) {
  console.error('Chybí TEST_USER_PASSWORD env proměnná. Spusť: TEST_USER_PASSWORD=\'...\' node scripts/create-test-user.mjs')
  process.exit(1)
}

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

let clerkUser
try {
  clerkUser = await clerk.users.createUser({
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
    emailAddress: [TEST_EMAIL],
    firstName: 'Test',
    lastName: 'Účet',
  })
  console.log('Clerk uživatel vytvořen:', clerkUser.id)
} catch (err) {
  if (err?.errors?.[0]?.code === 'form_identifier_exists') {
    console.log('Clerk uživatel "test" už existuje, hledám ho a vynucuji heslo...')
    const { data } = await clerk.users.getUserList({ username: [TEST_USERNAME] })
    clerkUser = data[0]
    if (!clerkUser) {
      console.error('Nenašel jsem existujícího uživatele "test" ani ho nejde vytvořit.')
      process.exit(1)
    }
    // Existující účet mohl mít heslo z dřívějšího pokusu — vynutit aktuální, ať přihlášení sedí.
    // (bez skipPasswordChecks — s tím Clerk označí heslo jako "untrusted" a sign-in
    // pak vyžaduje netriviální dodatečný krok, viz needs_client_trust)
    clerkUser = await clerk.users.updateUser(clerkUser.id, {
      password: TEST_PASSWORD,
    })
  } else {
    console.error('Chyba při vytváření Clerk uživatele:', JSON.stringify(err?.errors ?? err, null, 2))
    process.exit(1)
  }
}

const { error: upsertErr } = await db.from('users').upsert({
  id: clerkUser.id,
  email: TEST_EMAIL,
  full_name: 'Test Účet',
  plan: 'pro',
})

if (upsertErr) {
  console.error('Chyba při nastavování plánu v Supabase:', upsertErr.message)
  process.exit(1)
}

console.log('Hotovo. Přihlašovací údaje:')
console.log('  username:', TEST_USERNAME)
console.log('  password:', TEST_PASSWORD)
console.log('  (fallback email:', TEST_EMAIL, ')')
console.log('  plán: pro (nejvyšší)')
