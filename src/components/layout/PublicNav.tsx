'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const C = {
  bg: '#ffffff', bgSoft: '#fafafa',
  fg: '#0c0c0e', fg2: '#1f1f23',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#16a34a',
}

export function PublicNav() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()

  const navLinks: [string, string][] = [
    ['/funkce', 'Funkce'],
    ['/cenik', 'Ceník'],
    ['/kontakt', 'Kontakt'],
  ]

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <nav className="px-4 md:px-8" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', maxWidth: 1280, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link href="/" className="shrink-0" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="Fakturo" width={130} height={26} className="w-[110px] md:w-[144px] h-auto" />
          </Link>
          <div className="hidden md:flex" style={{ gap: 4, fontSize: 14, color: C.fg2, fontWeight: 500 }}>
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
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="transition-transform duration-150 ease-out hover:-translate-y-0.5"
              style={{
                background: C.primary, color: C.bg, padding: '9px 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden md:inline-block"
                style={{ color: C.fg2, fontWeight: 500, fontSize: 14, padding: '8px 14px', textDecoration: 'none' }}
              >
                Přihlásit se
              </Link>
              <Link
                href="/sign-up"
                className="transition-transform duration-150 ease-out hover:-translate-y-0.5"
                style={{
                  background: C.primary, color: C.bg, padding: '9px 16px', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)', whiteSpace: 'nowrap',
                }}
              >
                Zdarma →
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
