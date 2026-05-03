import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog – Fakturo',
  description: 'Tipy, návody a novinky pro freelancery a OSVČ. Jak fakturovat správně, jak ušetřit čas a jak rozvíjet byznys.',
}

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef', borderStrong: '#d4d4d8',
  primary: '#3a59ff', primarySoft: '#eef0ff',
}
const cont = { maxWidth: 1180, margin: '0 auto', padding: '0 32px' }
const disp = { letterSpacing: -2, fontWeight: 600 }

const categories: Record<string, { bg: string; color: string }> = {
  'Fakturace': { bg: C.primarySoft, color: C.primary },
  'Daně': { bg: '#fef3c7', color: '#92400e' },
  'Byznys': { bg: '#dcfce7', color: '#166534' },
  'Produkt': { bg: '#f3e8ff', color: '#7c3aed' },
}

const articles = [
  {
    category: 'Fakturace',
    date: '28. 4. 2026',
    title: 'Jak vystavit fakturu správně: průvodce pro OSVČ v roce 2026',
    perex: 'Co musí faktura povinně obsahovat, jak nastavit splatnost a co dělat, když klient neplatí. Kompletní průvodce pro každého živnostníka.',
    readTime: '7 min',
  },
  {
    category: 'Daně',
    date: '21. 4. 2026',
    title: 'Plátce nebo neplátce DPH? Co se vyplatí pro freelancera',
    perex: 'Kdy se vyplatí dobrovolně stát plátcem DPH a kdy je lepší zůstat neplátcem. Počítáme s čísly.',
    readTime: '5 min',
  },
  {
    category: 'Byznys',
    date: '14. 4. 2026',
    title: 'Retainer vs. hodinová sazba: co funguje lépe pro designéry a vývojáře',
    perex: 'Výhody a nevýhody obou modelů. Kdy přejít na retainer a jak ho klientovi prodat.',
    readTime: '6 min',
  },
  {
    category: 'Produkt',
    date: '7. 4. 2026',
    title: 'Nová funkce: automatické párování plateb s Fio bankou',
    perex: 'Jak funguje automatické párování plateb v Fakturo a jak si ho nastavit za 2 minuty.',
    readTime: '3 min',
  },
  {
    category: 'Fakturace',
    date: '31. 3. 2026',
    title: 'Upomínka při nezaplacení faktury: jak napsat slušně, ale jasně',
    perex: 'Tři šablony upomínek — od přátelského připomenutí po formální výzvu. Ke stažení zdarma.',
    readTime: '4 min',
  },
  {
    category: 'Byznys',
    date: '24. 3. 2026',
    title: '5 chyb, které dělají freelanceři při fakturaci (a jak se jim vyhnout)',
    perex: 'Zapomenuté náležitosti, špatná splatnost, absence smlouvy. Přehled nejčastějších chyb a jejich řešení.',
    readTime: '5 min',
  },
]

export default function BlogPage() {
  return (
    <div style={{ background: C.bg, color: C.fg }}>
      {/* Hero */}
      <section style={{ ...cont, padding: '96px 32px 72px' }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Blog</div>
          <h1 style={{ ...disp, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.02, letterSpacing: -3, margin: '0 0 20px' }}>
            Blog Fakturo
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: C.muted, margin: 0 }}>
            Tipy, návody a novinky pro freelancery a OSVČ.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section style={{ ...cont, padding: '0 32px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {articles.map((article, i) => {
            const cat = categories[article.category] ?? { bg: C.bgSoft, color: C.muted }
            return (
              <article key={i} style={{
                padding: 28, borderRadius: 16,
                border: `1px solid ${C.border}`, background: C.bg,
                display: 'flex', flexDirection: 'column',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: cat.bg, color: cat.color,
                  }}>
                    {article.category}
                  </span>
                  <span style={{ fontSize: 12, color: C.muted }}>{article.date}</span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', letterSpacing: -0.4, lineHeight: 1.35 }}>
                  {article.title}
                </h2>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 20px', lineHeight: 1.65, flex: 1 }}>
                  {article.perex}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.muted }}>🕐 {article.readTime} čtení</span>
                  <span style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>Číst →</span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 0' }}>
        <div style={{ ...cont, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Newsletter</div>
          <h2 style={{ ...disp, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: '0 0 16px', letterSpacing: -1.5 }}>
            Nové články přímo do mailu.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, margin: '0 auto 32px', maxWidth: 440, lineHeight: 1.6 }}>
            Jednou za dva týdny. Jen ty nejlepší tipy pro freelancery. Bez spamu.
          </p>
          <div style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto', justifyContent: 'center' }}>
            <input
              type="email"
              placeholder="tvuj@email.cz"
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 8, border: `1px solid ${C.borderStrong}`,
                background: C.bg, fontSize: 15, color: C.fg, outline: 'none',
                fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
              }}
            />
            <button style={{
              background: C.fg, color: C.bg, padding: '12px 20px', borderRadius: 8,
              fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Odebírat
            </button>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>Zrušit odběr kdykoliv jedním kliknutím.</div>
        </div>
      </section>

      {/* Note */}
      <section style={{ ...cont, padding: '40px 32px' }}>
        <div style={{ padding: '16px 20px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', fontSize: 13, color: '#92400e' }}>
          📝 Poznámka: Toto jsou ukázkové články. Reálný obsah bude doplněn postupně.
        </div>
      </section>
    </div>
  )
}
