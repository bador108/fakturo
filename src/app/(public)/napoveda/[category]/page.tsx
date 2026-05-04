import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Rocket, FileText, Users, Building2, RefreshCw, BarChart2, CreditCard, Lock, ChevronRight } from 'lucide-react'

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff', primarySoft: '#eef0ff',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }
const fg = '#0c0c0e'

const CATEGORIES: Record<string, {
  title: string
  desc: string
  icon: React.ReactNode
  articles: { title: string; slug: string; desc: string }[]
}> = {
  zaciname: {
    title: 'Začínáme',
    desc: 'Jak nastavit účet a vystavit první fakturu',
    icon: <Rocket size={22} color={fg} />,
    articles: [
      { title: 'Jak vystavit první fakturu', slug: 'jak-vystavit-prvni-fakturu', desc: 'Krok za krokem od registrace k první odeslané faktuře.' },
      { title: 'Nastavení profilu a firmy', slug: 'nastaveni-profilu-a-firmy', desc: 'Vyplň IČO, DIČ, adresu a logo — základ pro správné faktury.' },
      { title: 'Jak přidat prvního klienta', slug: 'jak-pridat-prvniho-klienta', desc: 'Načtení z ARES nebo ruční zadání.' },
      { title: 'Kde najdu své faktury', slug: 'kde-najdu-sve-faktury', desc: 'Přehled faktur, filtrování a vyhledávání.' },
      { title: 'Jak odeslat fakturu e-mailem', slug: 'jak-odeslat-fakturu-emailem', desc: 'Přímé odeslání PDF klientovi z aplikace.' },
      { title: 'Mobilní přístup k Fakturo', slug: 'mobilni-pristup', desc: 'Fakturo funguje v prohlížeči na mobilu i tabletu.' },
      { title: 'Jak změnit heslo nebo e-mail', slug: 'jak-zmenit-heslo-nebo-email', desc: 'Správa přihlašovacích údajů.' },
      { title: 'Jak kontaktovat podporu', slug: 'jak-kontaktovat-podporu', desc: 'Způsoby, jak nás rychle oslovit.' },
    ],
  },
  faktury: {
    title: 'Faktury',
    desc: 'Vystavení, úprava, odeslání a stornování',
    icon: <FileText size={22} color={fg} />,
    articles: [
      { title: 'Co musí faktura obsahovat', slug: 'co-musi-faktura-obsahovat', desc: 'Zákonné náležitosti dle § 29 ZDPH.' },
      { title: 'Jak vystavit zálohovou fakturu', slug: 'jak-vystavit-zalohovou-fakturu', desc: 'Záloha a následné vyúčtování.' },
      { title: 'Jak vystavit dobropis', slug: 'jak-vystavit-dobropis', desc: 'Opravný daňový doklad a stornování faktury.' },
      { title: 'Vlastní číselná řada faktur', slug: 'vlastni-ciselna-rada', desc: 'Nastavení formátu číslování (FAK2024001 apod.).' },
      { title: 'Jak přidat logo na fakturu', slug: 'jak-pridat-logo', desc: 'Nahrání firemního loga v Profi a Business tarifu.' },
      { title: 'Faktury v cizí měně (EUR, USD)', slug: 'faktury-v-cizi-mene', desc: 'Nastavení měny a přepočet kurzu ČNB.' },
      { title: 'QR platba na faktuře', slug: 'qr-platba-na-fakture', desc: 'Automatický QR kód pro rychlou platbu.' },
      { title: 'Jak upravit nebo smazat fakturu', slug: 'jak-upravit-nebo-smazat-fakturu', desc: 'Editace konceptu vs. stornování odeslané faktury.' },
      { title: 'PDF faktury — formát a vzhled', slug: 'pdf-faktury-format-a-vzhled', desc: 'Jak vypadá výsledné PDF a jak ho upravit.' },
      { title: 'Odeslání faktury klientovi', slug: 'odesilani-faktury-klientovi', desc: 'E-mail, stažení PDF, přímý odkaz.' },
      { title: 'Sledování splatnosti a upomínky', slug: 'sledovani-splatnosti-a-upominky', desc: 'Přehled nezaplacených faktur a automatické upomínky.' },
      { title: 'Storno a opravný doklad', slug: 'storno-a-opravny-doklad', desc: 'Jak správně stornovat fakturu.' },
    ],
  },
  klienti: {
    title: 'Klienti',
    desc: 'Správa klientů a firemní databáze',
    icon: <Users size={22} color={fg} />,
    articles: [
      { title: 'Jak přidat klienta', slug: 'jak-pridat-klienta', desc: 'Ruční zadání nebo načtení z ARES.' },
      { title: 'Načítání dat z ARES', slug: 'nacteni-dat-z-ares', desc: 'Stačí zadat IČO — adresa, DIČ a jméno se načtou samy.' },
      { title: 'Historie faktur klienta', slug: 'historie-faktur-klienta', desc: 'Přehled všech faktur a celkový obrat na jednom místě.' },
      { title: 'Úprava a mazání klientů', slug: 'uprava-a-mazani-klientu', desc: 'Jak aktualizovat nebo odebrat klienta z databáze.' },
      { title: 'Import klientů z Excelu', slug: 'import-klientu-z-excelu', desc: 'Hromadný import klientů ze souboru CSV/XLSX.' },
      { title: 'Firemní vs. soukromý klient', slug: 'firemni-vs-soukromy-klient', desc: 'Rozdíly ve fakturaci a povinné údaje.' },
    ],
  },
  'platby-a-banka': {
    title: 'Platby a banka',
    desc: 'Napojení na banku a párování plateb',
    icon: <Building2 size={22} color={fg} />,
    articles: [
      { title: 'Napojení na Fio banku', slug: 'napojeni-na-fio-banku', desc: 'Automatické párování plateb z Fio banky.' },
      { title: 'Napojení na jiné banky', slug: 'napojeni-na-jine-banky', desc: 'Přehled podporovaných bank a způsobů propojení.' },
      { title: 'Jak označit fakturu jako zaplacenou', slug: 'jak-oznacit-fakturu-jako-zaplacenou', desc: 'Ruční nebo automatické párování platby.' },
      { title: 'QR platba — jak funguje', slug: 'qr-platba-jak-funguje', desc: 'QR kód na faktuře a jak ho klient použije.' },
      { title: 'Přehled nezaplacených faktur', slug: 'prehled-nezaplacenych-faktur', desc: 'Filtrování faktur po splatnosti.' },
      { title: 'Upomínky a připomínky platby', slug: 'upominky-a-pripominky-platby', desc: 'Automatické e-maily klientovi před a po splatnosti.' },
      { title: 'Export plateb pro účetní', slug: 'export-plateb-pro-ucetni', desc: 'Přehled přijatých plateb v CSV/XML.' },
      { title: 'Přepočet kurzu u cizí měny', slug: 'prepocet-kurzu-u-cizi-meny', desc: 'Jak Fakturo počítá kurz ČNB pro fakturace v EUR/USD.' },
      { title: 'Cashflow přehled', slug: 'cashflow-prehled', desc: 'Celkový přehled příjmů a výdajů po měsících.' },
    ],
  },
  'pravidelne-fakturace': {
    title: 'Pravidelné fakturace',
    desc: 'Nastavení opakovaných faktur',
    icon: <RefreshCw size={22} color={fg} />,
    articles: [
      { title: 'Co jsou pravidelné fakturace', slug: 'co-jsou-pravidelne-fakturace', desc: 'Automatické vystavování faktur ve zvoleném intervalu.' },
      { title: 'Jak nastavit pravidelnou fakturaci', slug: 'jak-nastavit-pravidelnou-fakturaci', desc: 'Krok za krokem — klient, částka, interval, datum.' },
      { title: 'Dostupné intervaly opakování', slug: 'dostupne-intervaly-opakovani', desc: 'Týdně, měsíčně, čtvrtletně, ročně.' },
      { title: 'Jak pozastavit nebo zrušit opakování', slug: 'jak-pozastavit-nebo-zrusit-opakovani', desc: 'Správa aktivních pravidelných šablon.' },
      { title: 'Pravidelná fakturace pro retainer klienty', slug: 'pravidelna-fakturace-pro-retainer', desc: 'Měsíční paušál — nastavení jednou, fakturace automaticky.' },
    ],
  },
  'ucetni-export': {
    title: 'Účetní export',
    desc: 'Pohoda XML, PDF, CSV a měsíční podklady',
    icon: <BarChart2 size={22} color={fg} />,
    articles: [
      { title: 'Export pro účetní — Pohoda XML', slug: 'export-pro-ucetni-pohoda-xml', desc: 'Export faktur ve formátu pro Pohodu.' },
      { title: 'Export do CSV', slug: 'export-do-csv', desc: 'Tabulkový přehled faktur pro Excel nebo Google Sheets.' },
      { title: 'Export do ISDOC', slug: 'export-do-isdoc', desc: 'Standardní český formát pro elektronické faktury.' },
      { title: 'Jak sdílet přístup s účetní', slug: 'jak-sdilet-pristup-s-ucetni', desc: 'Přidání účetní jako uživatele v Business tarifu.' },
      { title: 'Podklady pro daňové přiznání', slug: 'podklady-pro-danove-priznani', desc: 'Jak připravit přehled faktur za zdaňovací období.' },
      { title: 'Kompatibilita s Money S3', slug: 'kompatibilita-s-money-s3', desc: 'Export dat pro Money S3.' },
      { title: 'Měsíční přehled příjmů', slug: 'mesicni-prehled-prijmu', desc: 'Reporty po měsících, čtvrtletích a rocích.' },
    ],
  },
  'predplatne-a-cenik': {
    title: 'Předplatné a ceník',
    desc: 'Plány, platby a správa předplatného',
    icon: <CreditCard size={22} color={fg} />,
    articles: [
      { title: 'Přehled tarifů a cen', slug: 'prehled-tarifu-a-cen', desc: 'Free, Profi a Business — co je v každém tarifu.' },
      { title: 'Jak změnit nebo zrušit předplatné', slug: 'jak-zmenit-nebo-zrusit-predplatne', desc: 'Upgrade, downgrade nebo zrušení kdykoli.' },
      { title: 'Roční předplatné a sleva', slug: 'rocni-predplatne-a-sleva', desc: '20% sleva při platbě za rok dopředu.' },
      { title: 'Co se stane po překročení limitu Free', slug: 'co-se-stane-po-prekroceni-limitu', desc: 'Fakturo tě upozorní a nabídne upgrade.' },
    ],
  },
  'bezpecnost-a-gdpr': {
    title: 'Bezpečnost a GDPR',
    desc: 'Ochrana dat a nastavení bezpečnosti',
    icon: <Lock size={22} color={fg} />,
    articles: [
      { title: 'Kde jsou uložená moje data', slug: 'kde-jsou-ulozena-moje-data', desc: 'Servery v EU, šifrování HTTPS, GDPR compliance.' },
      { title: 'Jak Fakturo chrání data', slug: 'jak-fakturo-chrani-data', desc: 'Šifrování, přístupová práva a zálohy.' },
      { title: 'GDPR a zpracování osobních údajů', slug: 'gdpr-a-zpracovani-osobnich-udaju', desc: 'Ty jsi správce, Fakturo je zpracovatel.' },
      { title: 'Jak stáhnout nebo smazat svá data', slug: 'jak-stahnout-nebo-smazat-svoja-data', desc: 'Export a právo na výmaz.' },
      { title: 'Dvoufaktorové ověření (2FA)', slug: 'dvoufaktorove-overeni', desc: 'Jak zapnout 2FA pro svůj účet.' },
    ],
  },
}

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES[category]
  if (!cat) return { title: 'Nápověda – Fakturo' }
  return {
    title: `${cat.title} – Nápověda – Fakturo`,
    description: cat.desc,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = CATEGORIES[category]
  if (!cat) notFound()

  return (
    <div style={{ background: C.bg, color: C.fg, minHeight: '100vh' }}>
      {/* Breadcrumb + header */}
      <section style={{ background: C.bgSoft, borderBottom: `1px solid ${C.border}`, padding: '56px 32px 48px' }}>
        <div style={cont}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted, marginBottom: 24 }}>
            <Link href="/napoveda" style={{ color: C.muted, textDecoration: 'none' }}>Nápověda</Link>
            <ChevronRight size={14} />
            <span style={{ color: C.fg }}>{cat.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: C.primarySoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cat.icon}
            </div>
            <h1 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: 0, letterSpacing: -1.5 }}>
              {cat.title}
            </h1>
          </div>
          <p style={{ fontSize: 16, color: C.muted, margin: 0, lineHeight: 1.6 }}>{cat.desc}</p>
        </div>
      </section>

      {/* Articles list */}
      <section style={{ ...cont, padding: '56px 32px' }}>
        <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {cat.articles.map((article, i, arr) => (
            <Link
              key={article.slug}
              href={`/napoveda/${category}/${article.slug}`}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                padding: '20px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                textDecoration: 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.fg2, marginBottom: 4 }}>{article.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{article.desc}</div>
              </div>
              <ChevronRight size={18} color={C.muted} style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, padding: '56px 32px', textAlign: 'center' }}>
        <div style={cont}>
          <p style={{ fontSize: 15, color: C.muted, margin: '0 0 20px' }}>Nenašel jsi co hledáš?</p>
          <Link href="/kontakt" style={{
            background: C.fg, color: C.bg, padding: '11px 22px', borderRadius: 10,
            fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          }}>
            Napsat nám →
          </Link>
        </div>
      </section>
    </div>
  )
}
