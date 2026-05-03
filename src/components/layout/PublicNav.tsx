'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff',
}

export function PublicNav() {
  const pathname = usePathname()

  const navLinks: [string, string][] = [
    ['/funkce', 'Funkce'],
    ['/cenik', 'Ceník'],
    ['/blog', 'Blog'],
  ]

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', maxWidth: 1280, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="Fakturo" width={110} height={29} />
          </Link>
          <div style={{ display: 'flex', gap: 4, fontSize: 14, color: C.fg2, fontWeight: 500 }}>
            {navLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: pathname === href ? C.fg : C.muted,
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontWeight: pathname === href ? 600 : 500,
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/sign-in"
            style={{ color: C.fg2, fontWeight: 500, fontSize: 14, padding: '8px 14px', textDecoration: 'none' }}
          >
            Přihlásit se
          </Link>
          <Link
            href="/sign-up"
            style={{
              background: C.fg, color: C.bg, padding: '9px 16px', borderRadius: 8,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            Vyzkoušet zdarma →
          </Link>
        </div>
      </nav>
    </header>
  )
}
