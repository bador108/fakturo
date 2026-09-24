import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { PricingSection } from '@/components/PricingSection'
import { AuthLink } from '@/components/home/HomeAuthLinks'
import { SiteNav } from '@/components/layout/SiteNav'
import { BotcraftWidget } from '@/components/BotcraftWidget'
import { PhoneDemo } from '@/components/phone-demo/PhoneDemo'
import { FeatureShowcase } from '@/components/FeatureShowcase'
import { Reveal } from '@/components/Reveal'

export const metadata: Metadata = {
  title: 'Fakturo – faktura za 30 vteřin | appka pro OSVČ',
  description: 'Vystav fakturu za 30 vteřin, ne za 30 minut. Fakturo hlídá platby a posílá upomínky za tebe. 5 faktur měsíčně zdarma, bez karty.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Fakturo – faktura za 30 vteřin',
    description: 'Vystav fakturu za 30 vteřin, ne za 30 minut. Fakturo hlídá platby a posílá upomínky za tebe. 5 faktur měsíčně zdarma, bez karty.',
    url: '/',
  },
}

// Stránka je statická a jednou za den se přegeneruje (kvůli roku v patičce).
export const revalidate = 86400

const C = {
  bg: '#ffffff', bgSoft: '#fafafa', bgDark: '#0c0c0e',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280', muted2: '#9ca3af',
  border: '#ececef', borderStrong: '#d4d4d8',
  // Text a tlačítka v brand zelené musí mít na bílé kontrast aspoň 4,5:1 (#16a34a měl jen 3,3:1).
  primary: '#15803d', primaryDark: '#166534', primarySoft: '#dcfce7',
  green: '#16a34a', greenSoft: '#dcfce7',
  gold: '#EAB308', goldDark: '#A16207', goldSoft: '#FEF9C3',
}
const disp = { letterSpacing: -2, fontWeight: 600 }
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const pageStyle: React.CSSProperties = {
  background: '#fafaf8', color: C.fg,
  fontFamily: "var(--font-dm-sans), -apple-system, system-ui, sans-serif",
  width: '100%', minHeight: '100%', WebkitFontSmoothing: 'antialiased',
  position: 'relative',
}
const meshBg: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
  background: [
    `radial-gradient(900px 700px at 10% 0%, ${C.primary}22, transparent 62%)`,
    `radial-gradient(820px 640px at 100% 10%, ${C.gold}1c, transparent 60%)`,
    `radial-gradient(760px 620px at 90% 90%, ${C.primary}1e, transparent 58%)`,
    `radial-gradient(700px 580px at 0% 85%, ${C.fg}14, transparent 58%)`,
    `radial-gradient(1000px 800px at 50% 45%, ${C.primary}0a, transparent 65%)`,
  ].join(', '),
}


function CheckIcon({ small }: { small?: boolean }) {
  const s = small ? 14 : 16
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="8" fill={C.greenSoft} />
      <path d="M5 8L7 10L11 6" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const heroPrimaryStyle: React.CSSProperties = { background: C.primary, color: C.bg, padding: '14px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 20px ${C.primary}40` }
const ctaPrimaryStyle: React.CSSProperties = { background: C.bg, color: C.fg, padding: '14px 26px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }

function Hero() {
  return (
    <section style={{ padding: '88px 0 64px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 560, pointerEvents: 'none',
        background: `radial-gradient(closest-side, ${C.primary}1f, transparent 72%)`,
        filter: 'blur(10px)',
      }} />
      <div style={{ ...cont, textAlign: 'center', position: 'relative' }}>
        <h1 style={{ ...disp, fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 24px', maxWidth: 900 }}>
          Faktura za <span style={{ color: C.primary }}>30 vteřin</span><br />Ne za 30 minut
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: C.muted, margin: '0 auto 36px', maxWidth: 580 }}>
          Vystavíš fakturu za půl minutu. Systém sám hlídá platby a posílá upomínky. Pro OSVČ a freelancery, kteří nechtějí trávit čas v účetním systému.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <AuthLink style={heroPrimaryStyle} signedOutLabel="Zkus to teď, bez karty →" signedInLabel="Přejít do dashboardu →" />
          <Link href="/generator" className="transition-transform duration-150 ease-out hover:-translate-y-0.5" style={{ background: C.bg, color: C.fg, border: `1.5px solid ${C.borderStrong}`, padding: '13px 22px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Podívat se, jak to funguje →
          </Link>
        </div>
        <div style={{ display: 'inline-flex', gap: 24, fontSize: 13, color: C.muted, fontWeight: 500, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(['Bez kreditní karty','5 faktur měsíčně zdarma','Zruš kdykoliv'] as string[]).map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckIcon small /> {t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ tag, title, text, reverse, children }: { tag:string; title:string; text:string; reverse?:boolean; children:React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr] gap-8 md:gap-16" style={{ alignItems: 'center', padding: '64px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ order: reverse ? 2 : 1 }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>{tag}</div>
        <h3 style={{ ...disp, fontSize: 40, margin: 0, marginBottom: 16, lineHeight: 1.1, letterSpacing: -1.5 }}>{title}</h3>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: C.muted, margin: 0, marginBottom: 24, maxWidth: 460 }}>{text}</p>
      </div>
      <div style={{ order: reverse ? 1 : 2 }}>{children}</div>
    </div>
  )
}

function InvoiceMock() {
  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 12px 32px rgba(15,15,30,0.06)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Faktura</div><div style={{ fontSize: 22, fontWeight: 700 }}>2026/042</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Dodavatel</div><div style={{ fontSize: 13, fontWeight: 600 }}>Jana Nováková</div><div style={{ fontSize: 12, color: C.muted }}>IČO 12345678</div></div>
        <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Odběratel</div><div style={{ fontSize: 13, fontWeight: 600 }}>Studio Pixel s.r.o.</div><div style={{ fontSize: 12, color: C.muted }}>IČO 87654321</div></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        {([['Webdesign — duben','20 000'],['UX konzultace (4h)','4 000'],['Drobné úpravy','850']] as string[][]).map(([k,v],i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
            <span style={{ color: C.fg2 }}>{k}</span><span style={{ fontWeight: 500 }}>{v} Kč</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: C.primarySoft, borderRadius: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Celkem</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: C.primary, letterSpacing: -0.5 }}>24 850 Kč</span>
      </div>
    </div>
  )
}

function BankMock() {
  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 12px 32px rgba(15,15,30,0.06)', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: C.green, display: 'block' }} />
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Výpis nahrán · Fio Bank · dnes 14:32</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([{ from:'Studio Pixel s.r.o.', amount:'+24 850', vs:'2026042', match:'2026/042', hl:true },{ from:'Atelier Holub', amount:'+18 200', vs:'2026041', match:'2026/041', hl:false },{ from:'Káva & Kód', amount:'+12 000', vs:'2026040', match:'2026/040', hl:false },{ from:'Vodafone CZ', amount:'−849', vs:'—', match:null, hl:false }] as {from:string,amount:string,vs:string,match:string|null,hl:boolean}[]).map((tx,i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: tx.hl ? C.primarySoft : C.bgSoft, border: tx.hl ? `1px solid ${C.primary}33` : `1px solid ${C.border}` }}>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{tx.from}</div><div style={{ fontSize: 11, color: C.muted }}>VS {tx.vs}</div></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: tx.amount.startsWith('+') ? C.green : C.fg2 }}>{tx.amount} Kč</div>
              {tx.match ? <div style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>✓ Spárováno → {tx.match}</div> : <div style={{ fontSize: 10, color: C.muted }}>—</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AutoMock() {
  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 12px 32px rgba(15,15,30,0.06)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Měsíční retainer · Studio Pixel</div><div style={{ fontSize: 12, color: C.muted }}>20 000 Kč · k 28. dni v měsíci</div></div>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: C.greenSoft, color: C.green, fontSize: 11, fontWeight: 600 }}>Aktivní</span>
      </div>
      {([{ date:'28. dub 2026', num:'2026/042', paid:true },{ date:'28. bře 2026', num:'2026/032', paid:true },{ date:'28. úno 2026', num:'2026/021', paid:true },{ date:'28. kvě 2026', num:'—', paid:false }] as {date:string,num:string,paid:boolean}[]).map((row,i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 90px 1fr', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? `1px dashed ${C.border}` : 'none', opacity: !row.paid ? 0.65 : 1 }}>
          <span style={{ fontSize: 12, color: C.muted }}>{row.date}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{row.num}</span>
          <span style={{ textAlign: 'right' }}>
            {row.paid
              ? <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:999,background:C.greenSoft,color:C.green,fontSize:11,fontWeight:600 }}>Zaplaceno</span>
              : <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:999,background:C.bgSoft,color:C.muted,fontSize:11,fontWeight:600,border:`1px dashed ${C.borderStrong}` }}>Naplánováno</span>
            }
          </span>
        </div>
      ))}
    </div>
  )
}

function Highlights() {
  const items: { n: string; title: string; text: string }[] = [
    { n: '01', title: 'Z hodin na minuty', text: 'Fakturu vystavíš a odešleš za 30 vteřin. Co dřív zabralo večer nad tabulkou, zvládneš mezi dvěma schůzkami.' },
    { n: '02', title: 'Platby samy', text: 'Nahraješ výpis z banky a Fakturo pozná, která platba patří ke které faktuře. Bez ručního hlídání.' },
    { n: '03', title: 'Bez ruční práce', text: 'Opakující se faktury a upomínky odejdou samy, přesně podle rozvrhu, kterej si nastavíš jednou.' },
  ]
  return (
    <section style={{ ...cont, padding: '0 32px 64px' }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.n} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark, marginBottom: 14, letterSpacing: 1 }}>{it.n}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.fg, margin: '0 0 8px', letterSpacing: -0.3 }}>{it.title}</h3>
            <p style={{ fontSize: 14, color: C.fg2, margin: 0, lineHeight: 1.6 }}>{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="funkce" style={{ ...cont, padding: '32px 32px 64px' }}>
      <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 24px' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Funkce</div>
        <h2 style={{ ...disp, fontSize: 52, margin: 0, lineHeight: 1.05, letterSpacing: -2 }}>Méně klikání víc tvojí práce</h2>
        <p style={{ fontSize: 17, color: C.muted, marginTop: 16, lineHeight: 1.55 }}>Vše, co OSVČ potřebuje k profesionální fakturaci. Nic, co nepotřebuje.</p>
      </div>
      <FeatureRow tag="Rychlost" title="Vystav fakturu za 30 vteřin" text="Šablony, automatické vyplnění z IČO, autocomplete klientů a sazeb. Pamatuje si tvoje pracovní zvyky a nabízí to, co skutečně používáš." reverse><InvoiceMock /></FeatureRow>
      <FeatureRow tag="Banka" title="Platby se párují automaticky" text="Nahraješ výpis z banky a Fakturo samo pozná, která platba patří ke které faktuře. Faktura se pak sama označí jako zaplacená."><BankMock /></FeatureRow>
      <FeatureRow tag="Automatizace" title="Pravidelné fakturace bez práce" text="Měsíční retainer s klientem? Nastav opakování — Fakturo vystaví a pošle fakturu samo." reverse><AutoMock /></FeatureRow>
    </section>
  )
}

function FeatureGrid() {
  return (
    <section style={{ ...cont, padding: '64px 32px 80px' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {([
          { title:'Slušné upomínky', text:'Mile, ale jasně. Tři varianty zdvořilosti, ty si vybereš.' },
          { title:'Víceměnové faktury', text:'CZK · EUR · USD s live kurzy ČNB. DPH 0, 12, 21 %.' },
          { title:'EU faktury', text:'Reverse charge a cizí měny (CZK, EUR, USD). S DPH i bez.' },
          { title:'Pro účetní', text:'Měsíční podklady jedním kliknutím. Pohoda XML, PDF.' },
          { title:'QR platby', text:'Ke každé faktuře automaticky QR kód. Klient naskenuje a zaplatí.' },
          { title:'Bezpečnost', text:'Šifrování v klidu i přenosu, GDPR a ověření přihlášení kódem z e-mailu.' },
        ] as {title:string,text:string}[]).map(f => (
          <div key={f.title} style={{ padding: 28, borderRadius: 14, border: `1px solid ${C.border}`, background: C.bg }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0, marginBottom: 8, letterSpacing: -0.3 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.55 }}>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const faqItems: [string, string][] = [
  ['Můžu zrušit kdykoliv?','Ano. Žádná výpovědní doba. Klikneš v nastavení a hotovo. Data si stáhneš v PDF i CSV.'],
  ['Fakturo je nové — proč bych mu měl věřit?','Stavíme appku od nuly pro dnešní legislativu, ne pro rok 2012 — bez starého kódu, který za sebou táhne roky kompromisů. Riziko si nemusíš brát na víru: začneš zdarma, bez karty, a data si kdykoliv odneseš v PDF i CSV. Když ti to nesedne, nic tě nedrží.'],
  ['Funguje to s českou legislativou?','Plátce i neplátce DPH a reverse charge. Vše, co OSVČ v ČR potřebuje.'],
  ['Umí Fakturo počítat DPH?','Jasně. U každé položky vybereš sazbu (0 %, 12 % nebo 21 %), Fakturo si samo spočítá základ i DPH a rozpad na faktuře. Sazbu ti dokonce umí i navrhnout podle toho, co fakturuješ.'],
  ['Jak funguje platba přes QR kód?','Každá faktura má vygenerovaný QR kód se všemi platebními údaji (formát SPAYD). Klient ho naskenuje bankovní appkou v mobilu a částka i variabilní symbol se vyplní samy — nic nepřepisuje.'],
  ['Co když už používám něco jiného?','Pošli nám export (Fakturoid, iDoklad, Money) a data převedeme zdarma.'],
  ['Co když mám účetní?','Stáhne si měsíční podklady jedním kliknutím — XML pro Pohodu i jiné programy.'],
  ['Funguje to v EU?','Cizí měny (CZK, EUR, USD) a reverse charge pro faktury do zemí EU.'],
  ['Jsou moje data v bezpečí?','Šifrování v klidu i přenosu, GDPR a ověření přihlášení kódem z e-mailu. Data jsou uložená v Evropě.'],
  ['Co se stane s mými daty, když appku přestanu používat?','Nic — jsou pořád tvoje. Export všech faktur do PDF nebo CSV je součástí i plánu zdarma, takže tě appka nikdy nedrží jako rukojmí.'],
]

function FAQ() {
  const items = faqItems
  return (
    <section id="faq" style={{ ...cont, padding: '32px 32px 80px', maxWidth: 880 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>FAQ</div>
        <h2 style={{ ...disp, fontSize: 44, margin: 0, lineHeight: 1.05, letterSpacing: -1.5 }}>Časté otázky</h2>
      </div>
      {items.map(([q,a],i) => (
        <details key={i} style={{ borderTop: `1px solid ${C.border}`, borderBottom: i===items.length-1 ? `1px solid ${C.border}` : 'none', padding: '20px 0' }}>
          <summary style={{ fontSize: 17, fontWeight: 600, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {q}<span style={{ fontSize: 20, color: C.muted, fontWeight: 400 }}>+</span>
          </summary>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 12, lineHeight: 1.6, maxWidth: 700 }}>{a}</div>
        </details>
      ))}
    </section>
  )
}

function FeatureShowcaseSection() {
  return (
    <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '88px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse, rgba(10,10,10,0.08), transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ ...cont, position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 56px' }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Appka zevnitř</div>
          <h2 style={{ ...disp, fontSize: 44, margin: 0, lineHeight: 1.05, letterSpacing: -1.5 }}>Žádné mockupy — skutečná appka</h2>
          <p style={{ fontSize: 17, color: C.muted, marginTop: 16, lineHeight: 1.55 }}>Prohlédni si, jak vypadá Fakturo zevnitř — přímo ze živého provozu.</p>
        </div>
        <FeatureShowcase />
      </div>
    </section>
  )
}

function Comparison() {
  type Row = { label: string; fakturo: string; fakturoid: string; idoklad: string; note?: string }
  const rows: Row[] = [
    { label: 'Cena od (měsíčně)', fakturo: '99 Kč', fakturoid: '199 Kč', idoklad: '~290 Kč' },
    { label: 'Zdarma varianta', fakturo: '5 faktur/měs, 5 klientů', fakturoid: 'do 5 klientů', idoklad: 'omezené doklady' },
    { label: 'Párování plateb', fakturo: 'nahraješ výpis, spáruje zpětně', fakturoid: 'jen e-mail od banky v reálném čase', idoklad: 'napojení na banku' },
    { label: 'QR platba na faktuře', fakturo: 'ano', fakturoid: 'ano', idoklad: 'ano' },
    { label: 'Export do Pohody', fakturo: 'v Pro plánu', fakturoid: 'ano', idoklad: 'ano' },
    { label: 'Vystavení faktury', fakturo: '~30 vteřin, mobil i desktop', fakturoid: 'formulář, víc kroků', idoklad: 'formulář, víc kroků' },
  ]
  return (
    <section id="srovnani" style={{ ...cont, padding: '88px 32px' }}>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Srovnání</div>
        <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px', letterSpacing: -1.5 }}>Fakturo vs. Fakturoid vs. iDoklad</h2>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.65 }}>Popisujeme to upřímně — někde jsme napřed, někde ne. Ceny konkurence jsou orientační k září 2026, ověř si je na jejich webu.</p>
      </div>
      <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 640 }}>
          <thead>
            <tr style={{ background: C.bgSoft }}>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, color: C.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}></th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 700, color: C.primaryDark }}>Fakturo</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, color: C.fg2 }}>Fakturoid</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, color: C.fg2 }}>iDoklad</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 1 ? C.bgSoft : 'transparent' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: C.fg2, whiteSpace: 'nowrap' }}>{r.label}</td>
                <td style={{ padding: '14px 20px', color: C.primaryDark, fontWeight: 600 }}>{r.fakturo}</td>
                <td style={{ padding: '14px 20px', color: C.muted }}>{r.fakturoid}</td>
                <td style={{ padding: '14px 20px', color: C.muted }}>{r.idoklad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: C.muted2, marginTop: 12, textAlign: 'center' }}>
        Fakturoid a iDoklad jsou zavedené appky s víc funkcemi než my (např. daňové přiznání). My sázíme na rychlost, jednodušší cenu a moderní rozhraní.
      </p>
    </section>
  )
}

function UseCases() {
  const groups: { title: string; text: string }[] = [
    { title: 'Programátor a vývojář', text: 'Fakturuješ klientům za hodiny nebo hotové dodávky. Šablona položek a opakující se faktura na měsíční retainer ti ušetří vyplňování pokaždé znovu.' },
    { title: 'Grafik a designér', text: 'Zálohová faktura na začátek zakázky, doplatek na konci. Vlastní logo na faktuře a víc profilů dodavatele, když fakturuješ pod víc jmény.' },
    { title: 'Řemeslník', text: 'Vystavíš fakturu z mobilu hned na place, klient zaplatí přes QR kód v bankovní appce. Žádné papírování večer doma.' },
    { title: 'Konzultant a poradce', text: 'Pravidelný měsíční retainer si appka vystaví a odešle sama. Upomínky na nezaplacené faktury jdou taky automaticky — ty se nemusíš ozývat sám.' },
  ]
  return (
    <section style={{ ...cont, padding: '88px 32px' }}>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Fakturo v praxi</div>
        <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px', letterSpacing: -1.5 }}>Pro koho to je</h2>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.65 }}>Fakturo používají OSVČ, freelanceři i malé firmy — každý trochu jinak. Pár příkladů, kde se lidi nejčastěji poznají.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
        {groups.map(g => (
          <div key={g.title} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 30 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', letterSpacing: -0.3 }}>{g.title}</h3>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: 0 }}>{g.text}</p>
          </div>
        ))}
      </div>
      <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 18, padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.2 }}>Máš účetní?</h3>
          <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6, maxWidth: 480 }}>Měsíční podklady jedním kliknutím — export do Pohody i obyčejné PDF/CSV. Naimportuje si je bez ručního přepisování.</p>
        </div>
        <Link href="/funkce" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.primaryDark, fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Zjistit víc <span>→</span>
        </Link>
      </div>
    </section>
  )
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 999 }}>
      <span style={{ width: 28, height: 28, borderRadius: 999, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.fg2, whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  )
}

function TrustBlock() {
  return (
    <section style={{ ...cont, padding: '0 32px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: C.fg2, margin: '0 0 16px' }}>
          Žádná kreditní karta. Žádný závazek. Vyzkoušíš zdarma a uvidíš sám, jestli ti to sedí — nemusíš věřit nikomu na slovo.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: C.fg2, margin: '0 0 32px' }}>
          A kdyby se ti to nesedlo: tvoje data jsou tvoje. Export do PDF i CSV kdykoliv, jedním klikem. Nic tě nedrží.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
          <TrustBadge text="Data v EU" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={C.primaryDark} strokeWidth="1.8" /><path d="M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z" stroke={C.primaryDark} strokeWidth="1.8" /><path d="M3 12h18" stroke={C.primaryDark} strokeWidth="1.8" /></svg>} />
          <TrustBadge text="Šifrovaný přenos i uložení" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke={C.primaryDark} strokeWidth="1.8" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={C.primaryDark} strokeWidth="1.8" /></svg>} />
          <TrustBadge text="GDPR" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3Z" stroke={C.primaryDark} strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke={C.primaryDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
        </div>
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
          Přecházíš z Fakturoidu, iDokladu nebo Money S3? Pošli nám export a data ti <strong style={{ color: C.fg2 }}>převedeme zdarma</strong>.
        </p>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section style={{ padding: '0 32px 80px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', background: C.bgDark, color: C.bg, borderRadius: 24, padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: `radial-gradient(ellipse, ${C.primary}33, transparent 70%)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(2rem,4.5vw,3.5rem)', margin: 0, marginBottom: 16, lineHeight: 1.05, letterSpacing: -2, color: C.bg }}>Vystav první fakturu za 30 sekund</h2>
          <p style={{ fontSize: 17, opacity: 0.7, marginBottom: 32, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>5 faktur měsíčně zdarma, bez kreditní karty. Žádný závazek. Žádné překvapení.</p>
          <AuthLink style={ctaPrimaryStyle} signedOutLabel="Vystav fakturu zdarma →" signedInLabel="Přejít do dashboardu →" />
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const cols = [
    { title: 'Produkt', items: [['Funkce','/funkce'],['Ceník','/cenik'],['Pravidelné fakturace','/pravidelne-fakturace']] as [string,string][] },
    { title: 'Společnost', items: [['O nás','/o-nas'],['Blog','/blog'],['Kontakt','/kontakt']] as [string,string][] },
    { title: 'Pomoc', items: [['GDPR','/gdpr'],['Obchodní podmínky','/obchodni-podminky']] as [string,string][] },
  ]
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: '64px 32px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-12" style={{ marginBottom: 48 }}>
        <div>
          <div style={{ marginBottom: 16 }}><Image src="/logo.png" alt="Fakturo" width={144} height={29} /></div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 280 }}>Fakturace pro OSVČ a freelancery.</div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{col.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.items.map(([label, href]) => <Link key={href} href={href} style={{ fontSize: 14, color: C.muted, textDecoration: 'none' }}>{label}</Link>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 24, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: C.muted, flexWrap: 'wrap', gap: 12 }}>
        <span>© {new Date().getFullYear()} Fakturo · Fakturace pro freelancery</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/gdpr" style={{ color: 'inherit', textDecoration: 'none' }}>GDPR</Link>
          <Link href="/obchodni-podminky" style={{ color: 'inherit', textDecoration: 'none' }}>Obchodní podmínky</Link>
        </div>
      </div>
    </footer>
  )
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Fakturo',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://fakturo.online',
  description: 'Online fakturace pro OSVČ a freelancery v Česku. Faktura za 30 vteřin, automatické párování plateb, QR platby, opakující se faktury.',
  offers: [
    { '@type': 'Offer', name: 'Zdarma', price: '0', priceCurrency: 'CZK' },
    { '@type': 'Offer', name: 'Start', price: '99', priceCurrency: 'CZK' },
    { '@type': 'Offer', name: 'Pro', price: '249', priceCurrency: 'CZK' },
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fakturo',
  url: 'https://fakturo.online',
  logo: 'https://fakturo.online/icon.png',
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fakturo',
  url: 'https://fakturo.online',
  inLanguage: 'cs-CZ',
}

export default function HomePage() {
  return (
    <div style={pageStyle}>
      <div style={meshBg} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <SiteNav />
      <main>
      <Hero />
      <Reveal>
        <section style={{ ...cont, padding: '80px 32px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16" style={{ alignItems: 'end', marginBottom: 56 }}>
            <div>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Jak to funguje</div>
              <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', margin: 0, maxWidth: 420 }}>
                Faktura za 30 sekund
              </h2>
            </div>
            <div>
              <p style={{ fontSize: 17, color: C.muted, margin: '0 0 16px', lineHeight: 1.6, maxWidth: 460 }}>
                Od dashboardu po platbu. Podívej se, jak to celé funguje.
              </p>
              <Link href="/generator" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: C.bgSoft, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.fg2, textDecoration: 'none' }}>
                Zjistit víc <span style={{ color: C.primary }}>→</span>
              </Link>
            </div>
          </div>
          <PhoneDemo />
        </section>
      </Reveal>
      <Reveal><Highlights /></Reveal>
      <Reveal><Features /></Reveal>
      <Reveal><FeatureGrid /></Reveal>
      <Reveal><FeatureShowcaseSection /></Reveal>
      <Reveal><UseCases /></Reveal>
      <Reveal><Comparison /></Reveal>
      <Reveal><TrustBlock /></Reveal>
      <Reveal>
        <section id="cenik" style={{ ...cont, padding: '80px 32px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
            <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Ceník</div>
            <h2 style={{ ...disp, fontSize: 52, margin: 0, lineHeight: 1.05, letterSpacing: -2, marginBottom: 16 }}>Ceny bez háčku</h2>
            <p style={{ fontSize: 17, color: C.muted, margin: 0, lineHeight: 1.55 }}>Začni zdarma, plať jen když to appka fakt využiješ.</p>
          </div>
          <PricingSection anchorId={null} />
        </section>
      </Reveal>
      <Reveal><FAQ /></Reveal>
      <Reveal><CTA /></Reveal>
      </main>
      <Footer />
      <BotcraftWidget botId="59438a4b-6478-4993-b935-081e4a7d5aea" />
      </div>
    </div>
  )
}
