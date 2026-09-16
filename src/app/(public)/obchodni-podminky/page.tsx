import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Obchodní podmínky – Fakturo',
  description: 'Obchodní podmínky služby Fakturo — pravidla užívání, platby, zrušení a odpovědnost.',
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

export default function ObchodniPodminkyPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Header */}
      <section style={{ ...cont, padding: '80px 32px 56px' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Právní dokument</div>
        <h1 style={{ ...disp, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05, letterSpacing: -2.5, margin: '0 0 20px' }}>
          Obchodní podmínky
        </h1>
        <div style={{ fontSize: 14, color: C.muted, padding: '12px 16px', background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 8, display: 'inline-block' }}>
          Platné od 1. 1. 2026
        </div>
      </section>

      {/* Document content */}
      <div style={{ ...cont, padding: '0 32px 96px' }}>

        <Section title="1. Poskytovatel a úvodní ustanovení">
          <p>Provozovatelem služby Fakturo (<strong>fakturo.online</strong>) je [DOPLNIT: jméno/název, IČO, sídlo, zápis v živnostenském/obchodním rejstříku] (dále jen „Poskytovatel“).</p>
          <p style={{ marginTop: 12 }}>Tyto obchodní podmínky upravují vzájemná práva a povinnosti Poskytovatele a osoby, která užívá službu Fakturo (dále jen „Uživatel“). Registrací účtu nebo užíváním služby Uživatel vyjadřuje souhlas s těmito podmínkami.</p>
          <p style={{ marginTop: 12 }}>Kontaktní email: <a href="mailto:support@fakturo.online" style={{ color: C.primary, textDecoration: 'none' }}>support@fakturo.online</a></p>
        </Section>

        <Section title="2. Popis služby">
          <p>Fakturo je webová aplikace pro tvorbu a správu faktur, evidenci klientů a výdajů, sledování cashflow a související fakturační agendu, určená především pro OSVČ, freelancery a malé firmy v České republice.</p>
          <p style={{ marginTop: 12 }}>Službu lze užívat v bezplatné variantě s omezeným rozsahem funkcí nebo v placených variantách (Start, Pro) s rozšířenými funkcemi. Aktuální rozsah a ceny jednotlivých variant jsou uvedeny na stránce <a href="/cenik" style={{ color: C.primary, textDecoration: 'none' }}>Ceník</a>.</p>
        </Section>

        <Section title="3. Registrace a uživatelský účet">
          <BulletList items={[
            'Pro plné užívání služby je nutná registrace uživatelského účtu.',
            'Uživatel je povinen uvádět při registraci a při fakturaci pravdivé a přesné údaje.',
            'Uživatel odpovídá za zabezpečení přístupu ke svému účtu a za veškerou činnost provedenou pod jeho účtem.',
            'Poskytovatel může účet pozastavit nebo zrušit při důvodném podezření na zneužití služby nebo porušení těchto podmínek.',
          ]} />
        </Section>

        <Section title="4. Cena a platební podmínky">
          <BulletList items={[
            'Placené varianty se hradí formou předplatného (měsíčně), platba probíhá prostřednictvím platební brány Stripe.',
            'Předplatné se automaticky obnovuje, dokud jej Uživatel nezruší.',
            'Zkušební doba (je-li nabízena) je časově omezená a po jejím uplynutí se — pokud Uživatel aktivně nezruší — mění na placené předplatné dle zvoleného tarifu.',
            'Uživatel může předplatné kdykoliv zrušit v nastavení účtu; služba zůstává aktivní do konce již zaplaceného období.',
            'Poskytovatel si vyhrazuje právo měnit ceník do budoucna; o zvýšení ceny stávajícího tarifu bude Uživatel předem informován.',
          ]} />
        </Section>

        <Section title="5. Odstoupení od smlouvy">
          <p>Je-li Uživatel spotřebitelem, má dle § 1829 občanského zákoníku právo odstoupit od smlouvy do 14 dnů od jejího uzavření bez udání důvodu.</p>
          <p style={{ marginTop: 12 }}>Vzhledem k povaze služby (digitální obsah/služba dodávaná okamžitě) bere Uživatel na vědomí, že aktivním využitím placené funkce před uplynutím 14denní lhůty (např. vygenerováním faktury v placeném tarifu) v souladu s § 1837 písm. l) občanského zákoníku právo na odstoupení od smlouvy v příslušném rozsahu zaniká.</p>
          <p style={{ marginTop: 12 }}>Žádost o odstoupení lze zaslat na <a href="mailto:support@fakturo.online" style={{ color: C.primary, textDecoration: 'none' }}>support@fakturo.online</a>.</p>
        </Section>

        <Section title="6. Práva a povinnosti Uživatele">
          <BulletList items={[
            'Uživatel odpovídá za obsah a správnost údajů, které do faktur a dalších dokumentů vloží (vlastní i klientské údaje).',
            'Uživatel se zavazuje neužívat službu k protiprávním účelům ani k vytváření fiktivních/podvodných dokladů.',
            'Poskytovatel neodpovídá za daňovou či účetní správnost dokladů vytvořených Uživatelem — Fakturo je nástroj, nikoli daňové poradenství.',
          ]} />
        </Section>

        <Section title="7. Odpovědnost a dostupnost služby">
          <BulletList items={[
            'Poskytovatel usiluje o maximální dostupnost služby, negarantuje ale nepřetržitý bezchybný provoz (výpadky infrastruktury třetích stran, údržba apod.).',
            'Poskytovatel neodpovídá za škodu vzniklou v důsledku nedostupnosti služby, ztráty dat způsobené třetí stranou nebo nesprávného užití služby Uživatelem.',
            'Odpovědnost Poskytovatele za škodu způsobenou v souvislosti s užíváním služby je omezena do výše uhrazeného předplatného za posledních 12 měsíců.',
            'Tímto ustanovením nejsou dotčena práva spotřebitele, která nelze smluvně omezit.',
          ]} />
        </Section>

        <Section title="8. Ochrana osobních údajů">
          <p>Zpracování osobních údajů v souvislosti s užíváním služby se řídí samostatnými <a href="/gdpr" style={{ color: C.primary, textDecoration: 'none' }}>Zásadami ochrany osobních údajů</a>.</p>
        </Section>

        <Section title="9. Duševní vlastnictví">
          <p>Software, design a obsah služby Fakturo jsou chráněny autorským právem a náleží Poskytovateli. Uživateli nevzniká užíváním služby žádné vlastnické právo k software, pouze licence k jeho užívání v rozsahu daném těmito podmínkami.</p>
          <p style={{ marginTop: 12 }}>Data a dokumenty, které Uživatel do služby vloží nebo vytvoří (faktury, klientská data apod.), zůstávají jeho vlastnictvím a lze je kdykoliv exportovat.</p>
        </Section>

        <Section title="10. Mimosoudní řešení sporů">
          <p>V případě sporu, který se nepodaří vyřešit přímo, může spotřebitel podat návrh na mimosoudní řešení České obchodní inspekci (<a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer" style={{ color: C.primary, textDecoration: 'none' }}>coi.cz</a>) nebo využít evropskou platformu pro řešení sporů online (<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: C.primary, textDecoration: 'none' }}>ec.europa.eu/consumers/odr</a>).</p>
        </Section>

        <Section title="11. Změny obchodních podmínek">
          <p>Poskytovatel může tyto podmínky přiměřeně měnit, zejména v souvislosti se změnou rozsahu služby nebo právních předpisů. O podstatných změnách bude Uživatel informován emailem nebo oznámením v aplikaci, a to nejméně 14 dní předem. Aktuální znění je vždy dostupné na této stránce.</p>
        </Section>

        <Section title="12. Závěrečná ustanovení">
          <p>Tyto obchodní podmínky se řídí právním řádem České republiky. Nedílnou součástí smluvního vztahu jsou i <a href="/gdpr" style={{ color: C.primary, textDecoration: 'none' }}>Zásady ochrany osobních údajů</a>.</p>
        </Section>

      </div>
    </div>
  )
}
