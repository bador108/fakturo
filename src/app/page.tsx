import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { BotcraftWidget } from '@/components/BotcraftWidget'
import { PricingSection } from '@/components/PricingSection'

const C = {
  bg: '#ffffff', bgSoft: '#fafafa', bgDark: '#0c0c0e',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280', muted2: '#9ca3af',
  border: '#ececef', borderStrong: '#d4d4d8',
  primary: '#3a59ff', primaryDark: '#2a47e0', primarySoft: '#eef0ff',
  green: '#16a34a', greenSoft: '#dcfce7',
}
const disp = { letterSpacing: -2, fontWeight: 600 }
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const pageStyle: React.CSSProperties = {
  background: C.bg, color: C.fg,
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
  width: '100%', minHeight: '100%', WebkitFontSmoothing: 'antialiased',
}

function Logo() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: 7, background: C.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.5" />
        <path d="M5 5h4M5 7.5h4M5 10h2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
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

function Nav({ userId }: { userId: string | null }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}` }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: C.fg }}>
            <Logo />
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.4 }}>Fakturo</span>
          </Link>
          <div style={{ display: 'flex', gap: 4, fontSize: 14, color: C.fg2, fontWeight: 500 }}>
            {([['#features','Funkce'],['#pricing','Ceník'],['#faq','FAQ']] as [string,string][]).map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'inherit', textDecoration: 'none', padding: '8px 12px', borderRadius: 6 }}>{label}</a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {userId ? (
            <Link href="/dashboard" style={{ background: C.fg, color: C.bg, padding: '9px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Dashboard →</Link>
          ) : (
            <>
              <Link href="/sign-in" style={{ color: C.fg2, fontWeight: 500, fontSize: 14, padding: '8px 14px', textDecoration: 'none' }}>Přihlásit se</Link>
              <Link href="/sign-up" style={{ background: C.fg, color: C.bg, padding: '9px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>Začít zdarma →</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function DashMock() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 16, overflow: 'hidden', background: C.bg, border: `1px solid ${C.border}`, boxShadow: '0 30px 80px rgba(15,15,30,0.12), 0 8px 24px rgba(15,15,30,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: C.bgSoft, borderBottom: `1px solid ${C.border}` }}>
        {(['#ff5f57','#febc2e','#28c840'] as string[]).map(bg => <div key={bg} style={{ width: 11, height: 11, borderRadius: 999, background: bg }} />)}
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: C.muted2, fontWeight: 500 }}>fakturo.cz/dashboard</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr' }}>
        <div style={{ borderRight: `1px solid ${C.border}`, padding: 16, background: C.bgSoft, minHeight: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 16 }}>
            <Logo />
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>Jana Nováková</div><div style={{ fontSize: 11, color: C.muted }}>Pro plán</div></div>
          </div>
          {([['Přehled','🏠',false,null],['Faktury','📄',true,'24'],['Klienti','👥',false,'12'],['Platby','💳',false,null]] as [string,string,boolean,string|null][]).map(([n,ic,active,badge]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 2, background: active ? C.bg : 'transparent', border: active ? `1px solid ${C.border}` : '1px solid transparent', fontSize: 13, color: active ? C.fg : C.muted, fontWeight: active ? 600 : 500 }}>
              <span style={{ fontSize: 14 }}>{ic}</span>
              <span style={{ flex: 1 }}>{n}</span>
              {badge && <span style={{ background: active ? C.primarySoft : 'transparent', color: active ? C.primary : C.muted2, padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>{badge}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div><div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>Faktury · Duben 2026</div><div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Přehled</div></div>
            <div style={{ background: C.fg, color: C.bg, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>+ Nová faktura</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            {([{ label:'Vystaveno', value:'148 200 Kč', delta:'+24%', color:C.fg },{ label:'Zaplaceno', value:'124 350 Kč', delta:'+18%', color:C.green },{ label:'Čeká', value:'23 850 Kč', delta:'2 faktury', color:C.muted }] as {label:string,value:string,delta:string,color:string}[]).map(s => (
              <div key={s.label} style={{ padding: 14, borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.delta}</div>
              </div>
            ))}
          </div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {([['2026/042','Studio Pixel s.r.o.','24 850 Kč','12. 5.','paid'],['2026/041','Atelier Holub','18 200 Kč','8. 5.','paid'],['2026/040','Káva & Kód','12 000 Kč','15. 5.','pending'],['2026/039','Notář Dvořák','5 600 Kč','3. 5.','overdue']] as string[][]).map(([num,klient,amount,due,stat],i,arr) => (
              <div key={num} style={{ padding: '12px 16px', fontSize: 13, display: 'grid', gridTemplateColumns: '120px 1fr 110px 100px 80px', gap: 12, alignItems: 'center', borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontWeight: 600 }}>{num}</span>
                <span style={{ color: C.fg2 }}>{klient}</span>
                <span style={{ textAlign: 'right', fontWeight: 600 }}>{amount}</span>
                <span style={{ color: C.muted }}>{due}</span>
                <span style={{ textAlign: 'right' }}>
                  {stat==='paid'&&<span style={{ display:'inline-block',padding:'2px 8px',borderRadius:999,background:C.greenSoft,color:C.green,fontSize:11,fontWeight:600 }}>Zaplaceno</span>}
                  {stat==='pending'&&<span style={{ display:'inline-block',padding:'2px 8px',borderRadius:999,background:'#fef3c7',color:'#a16207',fontSize:11,fontWeight:600 }}>Čeká</span>}
                  {stat==='overdue'&&<span style={{ display:'inline-block',padding:'2px 8px',borderRadius:999,background:'#fee2e2',color:'#b91c1c',fontSize:11,fontWeight:600 }}>Po splat.</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero({ userId }: { userId: string | null }) {
  return (
    <section style={{ padding: '88px 0 64px' }}>
      <div style={{ ...cont, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', borderRadius: 999, background: C.bgSoft, border: `1px solid ${C.border}`, fontSize: 13, color: C.fg2, marginBottom: 28, fontWeight: 500 }}>
          <span style={{ background: C.primary, color: C.bg, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>Nově</span>
          Bankovní synchronizace s Fio, ČSOB a KB
          <span style={{ color: C.muted2 }}>→</span>
        </div>
        <h1 style={{ ...disp, fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 auto 24px', maxWidth: 900 }}>
          Fakturace pro lidi,<br />kteří dělají skutečnou práci.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: C.muted, margin: '0 auto 36px', maxWidth: 580 }}>
          Vystav fakturu za půl minuty, hlídej platby a posílej upomínky. Pro OSVČ a freelancery, kteří chtějí strávit méně času papírováním.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <Link href={userId ? '/dashboard' : '/sign-up'} style={{ background: C.fg, color: C.bg, padding: '14px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.08)' }}>
            {userId ? 'Přejít do dashboardu →' : 'Začít zdarma — 14 dní'}
          </Link>
          <Link href="/sign-in" style={{ background: C.bg, color: C.fg, border: `1px solid ${C.borderStrong}`, padding: '13px 22px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={C.fg} strokeWidth="1.3" /><path d="M5.5 4.5L9.5 7L5.5 9.5V4.5Z" fill={C.fg} /></svg>
            Podívat se na ukázku
          </Link>
        </div>
        <div style={{ display: 'inline-flex', gap: 24, fontSize: 13, color: C.muted, fontWeight: 500, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(['Bez kreditní karty','14 dní zdarma','Zruš kdykoliv'] as string[]).map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckIcon small /> {t}</span>
          ))}
        </div>
      </div>
      <div style={{ ...cont, paddingTop: 64 }}><DashMock /></div>
    </section>
  )
}

function TrustBar() {
  return (
    <section style={{ ...cont, padding: '56px 32px' }}>
      <div style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginBottom: 32, fontWeight: 500 }}>
        Důvěřuje nám přes <strong style={{ color: C.fg }}>4 200 freelancerů</strong> a malých firem
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.55, fontSize: 17, fontWeight: 600, color: C.fg2, flexWrap: 'wrap', gap: 16 }}>
        {(['Atelier Holub','Studio Pixel','Káva & Kód','pixelpilot','Dřevořez','Notář Dvořák'] as string[]).map(l => <div key={l}>{l}</div>)}
      </div>
    </section>
  )
}

function Metrics() {
  return (
    <section style={{ ...cont, padding: '32px 32px 80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 16, padding: '32px 0' }}>
        {([['4 200+','aktivních uživatelů'],['1.2M','vystavených faktur'],['32 s','průměrný čas vystavení'],['4.9','hodnocení v App Store']] as string[][]).map(([num,label],i,arr) => (
          <div key={label} style={{ padding: '0 24px', textAlign: 'center', borderRight: i < arr.length-1 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ ...disp, fontSize: 36, lineHeight: 1, marginBottom: 6, fontWeight: 700 }}>{num}</div>
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeatureRow({ tag, title, text, reverse, children }: { tag:string; title:string; text:string; reverse?:boolean; children:React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '5fr 6fr', gap: 64, alignItems: 'center', padding: '64px 0', borderBottom: `1px solid ${C.border}` }}>
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
        <span style={{ padding: '4px 10px', borderRadius: 999, background: C.greenSoft, color: C.green, fontSize: 11, fontWeight: 600 }}>Vystaveno za 32 s</span>
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
        <span style={{ width: 8, height: 8, borderRadius: 999, background: C.green, display: 'block', boxShadow: `0 0 8px ${C.green}` }} />
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Live · Fio Bank · sync před 12 s</span>
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

function Features() {
  return (
    <section id="features" style={{ ...cont, padding: '32px 32px 64px' }}>
      <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 24px' }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Funkce</div>
        <h2 style={{ ...disp, fontSize: 52, margin: 0, lineHeight: 1.05, letterSpacing: -2 }}>Méně klikání, víc tvojí práce.</h2>
        <p style={{ fontSize: 17, color: C.muted, marginTop: 16, lineHeight: 1.55 }}>Vše, co OSVČ potřebuje k profesionální fakturaci. Nic, co nepotřebuje.</p>
      </div>
      <FeatureRow tag="Rychlost" title="Vystav fakturu za 30 vteřin." text="Šablony, automatické vyplnění z IČO, autocomplete klientů a sazeb. Pamatuje si tvoje pracovní zvyky a nabízí to, co skutečně používáš." reverse><InvoiceMock /></FeatureRow>
      <FeatureRow tag="Banka" title="Platby se párují automaticky." text="Napojení na Fio, ČSOB, KB, Raiffeisen a Air Bank. Když přijde platba, faktura se sama označí jako zaplacená."><BankMock /></FeatureRow>
      <FeatureRow tag="Automatizace" title="Pravidelné fakturace bez práce." text="Měsíční retainer s klientem? Nastav opakování — Fakturo vystaví a pošle fakturu samo. Včetně EU faktur s VIES." reverse><AutoMock /></FeatureRow>
    </section>
  )
}

function FeatureGrid() {
  return (
    <section style={{ ...cont, padding: '64px 32px 80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {([{ title:'Slušné upomínky', text:'Mile, ale jasně. Tři varianty zdvořilosti, ty si vybereš.', icon:'📬' },{ title:'Víceměnové faktury', text:'CZK · EUR · USD s live kurzy ČNB. DPH 0, 15, 21 %.', icon:'🌍' },{ title:'EU faktury', text:'VIES, OSS, reverse charge, cizí měny. S DPH i bez.', icon:'🇪🇺' },{ title:'Pro účetní', text:'Měsíční podklady jedním kliknutím. Pohoda XML, PDF.', icon:'📊' },{ title:'API + webhooky', text:'Napoj si Fakturo na cokoliv. REST API, webhooks.', icon:'🔌' },{ title:'Bezpečnost', text:'Šifrování v klidu i přenosu, GDPR, 2FA, audit log.', icon:'🔒' }] as {title:string,text:string,icon:string}[]).map(f => (
          <div key={f.title} style={{ padding: 28, borderRadius: 14, border: `1px solid ${C.border}`, background: C.bg }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0, marginBottom: 8, letterSpacing: -0.3 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.55 }}>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 0' }}>
      <div style={{ ...cont, textAlign: 'center', maxWidth: 800 }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Reference</div>
        <blockquote style={{ ...disp, fontSize: 'clamp(1.5rem,3vw,2.25rem)', lineHeight: 1.25, margin: 0, marginBottom: 32, letterSpacing: -1.2, fontWeight: 500 }}>
          „Konečně nástroj, který nezatěžuje. Vystavím fakturu mezi dvěma e-maily, banka platby spáruje sama a já se nemusím starat. To mi vrátilo víkendy."
        </blockquote>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>L</div>
          <div style={{ textAlign: 'left' }}><div style={{ fontSize: 14, fontWeight: 600 }}>Lenka Marková</div><div style={{ fontSize: 13, color: C.muted }}>Copywriterka · Brno · používá 14 měsíců</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 64, textAlign: 'left' }}>
          {([{ q:'Konečně něco rychlejšího než Excel a chytřejšího než Word.', a:'Petr H.', role:'Grafik · Praha' },{ q:'Pravidelné fakturace mě zachránily. Klienti dostávají faktury samy.', a:'Tomáš V.', role:'Vývojář · Olomouc' },{ q:'Líbí se mi, že to neumí všechno. Umí přesně to, co potřebuju.', a:'Markéta D.', role:'Architektka · Brno' }] as {q:string,a:string,role:string}[]).map((t,i) => (
            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 24, borderRadius: 12 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {([1,2,3,4,5] as number[]).map(s => <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill={C.primary}><path d="M7 1l1.8 4 4.2.6-3 3 0.7 4.4L7 11l-3.7 2 0.7-4.4-3-3 4.2-.6L7 1z" /></svg>)}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.55, marginBottom: 16, color: C.fg2 }}>{t.q}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.a}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const items: [string,string][] = [
    ['Můžu zrušit kdykoliv?','Ano. Žádná výpovědní doba. Klikneš v nastavení a hotovo. Data si stáhneš v PDF i CSV.'],
    ['Funguje to s českou legislativou?','Plátce i neplátce DPH, OSS, reverse charge. Vše, co OSVČ v ČR potřebuje.'],
    ['Co když už používám něco jiného?','Pošli nám export (Fakturoid, iDoklad, Money) a data převedeme zdarma.'],
    ['Co když mám účetní?','Stáhne si měsíční podklady jedním kliknutím — XML pro Pohodu i jiné programy.'],
    ['Funguje to v EU?','Cizí měny, VIES validace, OSS pro digitální služby, reverse charge.'],
    ['Jsou moje data v bezpečí?','Šifrování v klidu i přenosu, GDPR, 2FA, denní zálohy. Servery v EU.'],
  ]
  return (
    <section id="faq" style={{ ...cont, padding: '32px 32px 80px', maxWidth: 880 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>FAQ</div>
        <h2 style={{ ...disp, fontSize: 44, margin: 0, lineHeight: 1.05, letterSpacing: -1.5 }}>Časté otázky.</h2>
      </div>
      {items.map(([q,a],i) => (
        <details key={i} style={{ borderTop: `1px solid ${C.border}`, borderBottom: i===items.length-1 ? `1px solid ${C.border}` : 'none', padding: '20px 0' }}>
          <summary style={{ fontSize: 17, fontWeight: 600, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {q}<span style={{ fontSize: 20, color: C.muted, fontWeight: 400 }}>+</span>
          </summary>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 12, lineHeight: 1.6, maxWidth: 700 }}>{a}</div>
        </details>
      ))}
    </section>
  )
}

function CTA({ userId }: { userId: string | null }) {
  return (
    <section style={{ padding: '0 32px 80px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', background: C.bgDark, color: C.bg, borderRadius: 24, padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: `radial-gradient(ellipse, ${C.primary}33, transparent 70%)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(2rem,4.5vw,3.5rem)', margin: 0, marginBottom: 16, lineHeight: 1.05, letterSpacing: -2, color: C.bg }}>Vystav první fakturu ještě dnes.</h2>
          <p style={{ fontSize: 17, opacity: 0.7, marginBottom: 32, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>14 dní zdarma, bez kreditní karty. Žádný závazek. Žádné překvapení.</p>
          <Link href={userId ? '/dashboard' : '/sign-up'} style={{ background: C.bg, color: C.fg, padding: '14px 26px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Začít zdarma →</Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const cols = [
    { title: 'Produkt', items: ['Funkce','Ceník','Pravidelné fakturace','API'] },
    { title: 'Společnost', items: ['O nás','Kontakt','Blog','Reference'] },
    { title: 'Pomoc', items: ['Nápověda','Stav služby','Bezpečnost','GDPR'] },
  ]
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: '64px 32px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Logo /><span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.4 }}>Fakturo</span></div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 280 }}>Fakturace pro OSVČ a freelancery. Vystavená v Praze, od roku 2024.</div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{col.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.items.map(it => <span key={it} style={{ fontSize: 14, color: C.muted }}>{it}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 24, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: C.muted, flexWrap: 'wrap', gap: 12 }}>
        <span>© {new Date().getFullYear()} Fakturo · Fakturace pro freelancery</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Obchodní podmínky</Link>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>GDPR</Link>
        </div>
      </div>
    </footer>
  )
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ home?: string }> }) {
  const { userId } = await auth()
  const { home } = await searchParams
  if (userId && !home) redirect('/dashboard')

  return (
    <div style={pageStyle}>
      <Nav userId={userId} />
      <Hero userId={userId} />
      <TrustBar />
      <Metrics />
      <Features />
      <FeatureGrid />
      <Testimonials />
      <section id="pricing" style={{ ...cont, padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Ceník</div>
          <h2 style={{ ...disp, fontSize: 52, margin: 0, lineHeight: 1.05, letterSpacing: -2, marginBottom: 16 }}>Férová cena, žádné překvapení.</h2>
          <p style={{ fontSize: 17, color: C.muted, margin: 0, lineHeight: 1.55 }}>Plať měsíčně, zruš kdykoliv. Bez závazků. Začni zdarma.</p>
        </div>
        <PricingSection />
      </section>
      <FAQ />
      <CTA userId={userId} />
      <Footer />
      <BotcraftWidget botId="6523f5b5-fa53-4d8a-b0d2-214c90693499" />
    </div>
  )
}
