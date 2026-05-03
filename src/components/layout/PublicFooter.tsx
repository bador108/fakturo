import Link from 'next/link'
import Image from 'next/image'

const C = {
  bg: '#ffffff',
  fg: '#0c0c0e',
  muted: '#6b7280',
  border: '#ececef',
}

const cols = [
  {
    title: 'Produkt',
    items: [
      { label: 'Funkce', href: '/funkce' },
      { label: 'Ceník', href: '/cenik' },
      { label: 'Pravidelné fakturace', href: '/pravidelne-fakturace' },
      { label: 'API', href: '/api-developers' },
    ],
  },
  {
    title: 'Společnost',
    items: [
      { label: 'O nás', href: '/o-nas' },
      { label: 'Kontakt', href: '/kontakt' },
      { label: 'Blog', href: '/blog' },
      { label: 'Reference', href: '/reference' },
    ],
  },
  {
    title: 'Pomoc',
    items: [
      { label: 'Nápověda', href: '/napoveda' },
      { label: 'Stav služby', href: '/stav-sluzby' },
      { label: 'Bezpečnost', href: '/bezpecnost' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: '64px 32px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <Image src="/logo.png" alt="Fakturo" width={110} height={29} />
          </div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 280 }}>
            Fakturace pro OSVČ a freelancery.
          </div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{col.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.items.map(it => (
                <Link
                  key={it.href}
                  href={it.href}
                  style={{ fontSize: 14, color: C.muted, textDecoration: 'none' }}
                >
                  {it.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        paddingTop: 24, borderTop: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, color: C.muted, flexWrap: 'wrap', gap: 12,
      }}>
        <span>© 2026 Fakturo. Všechna práva vyhrazena.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/gdpr" style={{ color: 'inherit', textDecoration: 'none' }}>GDPR</Link>
          <Link href="/bezpecnost" style={{ color: 'inherit', textDecoration: 'none' }}>Bezpečnost</Link>
        </div>
      </div>
    </footer>
  )
}
