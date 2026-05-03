import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů (GDPR) – Fakturo',
  description: 'Zásady ochrany osobních údajů Fakturo. Jak zpracováváme a chráníme tvoje data v souladu s GDPR.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff',
}
const cont = { maxWidth: 800, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px', letterSpacing: -0.5 }}>{title}</h2>
      <div style={{ fontSize: 15, color: C.fg2, lineHeight: 1.75 }}>{children}</div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '12px 0', padding: 0, listStyle: 'none' }}>
      {items.map(item => (
        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <span style={{ color: C.primary, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function GdprPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Header */}
      <section style={{ ...cont, padding: '80px 32px 56px' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Právní dokument</div>
        <h1 style={{ ...disp, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05, letterSpacing: -2.5, margin: '0 0 20px' }}>
          Ochrana osobních údajů
        </h1>
        <div style={{ fontSize: 14, color: C.muted, padding: '12px 16px', background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 8, display: 'inline-block' }}>
          Platné od 1. 1. 2026 · Naposledy aktualizováno: 3. 5. 2026
        </div>
      </section>

      {/* Document content */}
      <div style={{ ...cont, padding: '0 32px 96px' }}>

        <Section title="1. Správce osobních údajů">
          <p>Správcem osobních údajů je Václav Urbanec, provozovatel služby Fakturo (<strong>fakturo-seven.vercel.app</strong>), Česká republika.</p>
          <p style={{ marginTop: 12 }}>Kontaktní email: <a href="mailto:fakturosupport@gmail.com" style={{ color: C.primary, textDecoration: 'none' }}>fakturosupport@gmail.com</a></p>
        </Section>

        <Section title="2. Jaké osobní údaje zpracováváme">
          <p>Při užívání služby Fakturo zpracováváme tyto kategorie osobních údajů:</p>
          <BulletList items={[
            'Registrační údaje: jméno, e-mailová adresa, heslo (uloženo jako hash)',
            'Fakturační údaje: IČO, DIČ, adresa, bankovní spojení',
            'Údaje klientů: jméno/název, adresa, IČO, e-mail (zadávané uživatelem)',
            'Transakční data: faktury, platby, historické záznamy',
            'Technické údaje: IP adresa, typ prohlížeče, cookies, logy',
          ]} />
        </Section>

        <Section title="3. Účel a právní základ zpracování">
          <p>Osobní údaje zpracováváme na základě těchto právních titulů:</p>
          <BulletList items={[
            'Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR) — provoz uživatelského účtu a poskytování služby',
            'Oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR) — bezpečnost, prevence podvodů, technický provoz',
            'Plnění právní povinnosti (čl. 6 odst. 1 písm. c) GDPR) — daňové a účetní předpisy',
            'Souhlas (čl. 6 odst. 1 písm. a) GDPR) — marketingová komunikace, newsletter',
          ]} />
        </Section>

        <Section title="4. Doba uchovávání dat">
          <BulletList items={[
            'Uživatelský účet: po dobu trvání smluvního vztahu + 1 rok po zrušení účtu',
            'Faktury a fakturační záznamy: 10 let (zákonná povinnost dle zákona o účetnictví)',
            'Technické logy: 90 dní',
            'Marketingové souhlasy: do odvolání souhlasu',
          ]} />
        </Section>

        <Section title="5. Příjemci osobních údajů">
          <p>Vaše data sdílíme pouze s důvěryhodnými zpracovateli v nezbytném rozsahu:</p>
          <BulletList items={[
            'Clerk Inc. — autentizace uživatelů (USA, standardní smluvní doložky EU)',
            'Supabase Inc. — databáze a úložiště (EU region — Frankfurt)',
            'Stripe Inc. — zpracování plateb (USA, standardní smluvní doložky EU)',
            'Vercel Inc. — hosting webové aplikace (USA, standardní smluvní doložky EU)',
          ]} />
          <p style={{ marginTop: 12 }}>Data neprodáváme třetím stranám ani je nepoužíváme k reklamním účelům.</p>
        </Section>

        <Section title="6. Vaše práva">
          <p>Jako subjekt údajů máte tato práva:</p>
          <BulletList items={[
            'Právo na přístup k osobním údajům (čl. 15 GDPR)',
            'Právo na opravu nepřesných údajů (čl. 16 GDPR)',
            'Právo na výmaz („právo být zapomenut") (čl. 17 GDPR)',
            'Právo na omezení zpracování (čl. 18 GDPR)',
            'Právo na přenositelnost dat (čl. 20 GDPR) — export v PDF nebo CSV',
            'Právo vznést námitku (čl. 21 GDPR)',
            'Právo podat stížnost u Úřadu pro ochranu osobních údajů (uoou.cz)',
          ]} />
          <p style={{ marginTop: 12 }}>Žádost o uplatnění práv zasílejte na: <a href="mailto:fakturosupport@gmail.com" style={{ color: C.primary, textDecoration: 'none' }}>fakturosupport@gmail.com</a>. Odpovídáme do 30 dnů.</p>
        </Section>

        <Section title="7. Soubory cookies">
          <p>Fakturo používá pouze technicky nezbytné cookies pro fungování aplikace (session cookies) a analytické cookies pro zlepšení služby (Google Analytics, Vercel Analytics). Analytické cookies jsou anonymizovány.</p>
          <p style={{ marginTop: 12 }}>Cookies můžete spravovat v nastavení vašeho prohlížeče.</p>
        </Section>

        <Section title="8. Zabezpečení dat">
          <p>Implementujeme technická a organizační opatření k ochraně vašich dat:</p>
          <BulletList items={[
            'Šifrování přenosu dat (TLS 1.3)',
            'Šifrování dat v databázi (AES-256)',
            'Dvoufaktorová autentizace',
            'Pravidelné bezpečnostní audity',
            'Přístup na principu nejnižších oprávnění',
          ]} />
          <p style={{ marginTop: 12 }}>
            Více informací na stránce <a href="/bezpecnost" style={{ color: C.primary, textDecoration: 'none' }}>Bezpečnost</a>.
          </p>
        </Section>

        <Section title="9. Změny těchto zásad">
          <p>O podstatných změnách vás budeme informovat emailem a upozorněním v aplikaci, a to nejméně 14 dní předem. Aktuální verze je vždy dostupná na této stránce.</p>
        </Section>

        <Section title="10. Kontakt">
          <p>Pro jakékoli dotazy ke zpracování osobních údajů nás kontaktujte:</p>
          <BulletList items={[
            'Email: fakturosupport@gmail.com',
            'Formulář: fakturo-seven.vercel.app/kontakt',
          ]} />
        </Section>
      </div>
    </div>
  )
}
