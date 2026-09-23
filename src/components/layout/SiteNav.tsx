'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Stejné tokeny jako zbytek marketingu (viz page.tsx / PublicFooter) — appka
// vlastní bg-brand/ink/paper v tailwind.config je pro dashboard (skoro černá),
// sem nepatří.
const C = {
  surface: 'rgba(255,252,246,0.82)',
  pill: 'rgba(242,242,239,0.75)',
  chip: '#fffcf6',
  ink: '#0c0c0e',
  muted: '#6b7280',
  primary: '#15803d',
  border: 'rgba(220,215,200,0.7)',
}

const NAV_LINKS = [
  { id: 'funkce', href: '/#funkce', label: 'Funkce' },
  { id: 'srovnani', href: '/#srovnani', label: 'Srovnání' },
  { id: 'cenik', href: '/#cenik', label: 'Ceník' },
  { id: 'faq', href: '/#faq', label: 'FAQ' },
]

export function SiteNav() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy jede jen tam, kde sekce fakt jsou (homepage) — na podstránkách
  // observer nenajde nic a active zůstane null, což je v pořádku.
  useEffect(() => {
    if (pathname !== '/') { setActive(null); return }
    const els = NAV_LINKS.map(l => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const observer = new IntersectionObserver(
      entries => {
        const hit = entries.find(e => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-40% 0px -50% 0px' },
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header className={cn('sticky top-0 z-40 px-3 transition-[padding-top] duration-200', open ? 'pb-2' : '')} style={{ paddingTop: scrolled ? 8 : 12 }}>
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border backdrop-blur-md transition-shadow duration-200"
        style={{
          background: C.surface,
          borderColor: C.border,
          boxShadow: scrolled ? '0 8px 30px -14px rgba(20,23,17,0.5)' : '0 8px 30px -18px rgba(20,23,17,0.45)',
          padding: '6px 6px 6px 16px',
        }}
      >
        <Link href="/" className="flex shrink-0 items-center" style={{ textDecoration: 'none' }} aria-label="Fakturo — domů">
          <Image src="/logo.png" alt="Fakturo" width={130} height={26} className="hidden h-6 w-auto min-[420px]:block" />
          <Image src="/icon.png" alt="Fakturo" width={28} height={28} className="h-7 w-7 min-[420px]:hidden" />
        </Link>

        <div className="hidden items-center gap-0.5 rounded-full p-1 lg:flex" style={{ background: C.pill }}>
          {NAV_LINKS.map(l => {
            const isActive = active === l.id
            return (
              <Link
                key={l.id}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150"
                style={{ color: isActive ? C.ink : C.muted, background: isActive ? C.chip : 'transparent', boxShadow: isActive ? '0 1px 4px rgba(20,23,17,0.1)' : 'none' }}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="hidden items-center rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 md:inline-flex"
              style={{ background: C.primary, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="hidden px-3 py-2 text-sm font-medium transition-colors duration-150 lg:inline-block" style={{ color: C.muted }}>
                Přihlásit se
              </Link>
              <Link
                href="/sign-up"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 md:inline-flex"
                style={{ background: C.primary, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
              >
                Začít zdarma <span aria-hidden>→</span>
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-150 md:hidden"
            style={{ background: C.pill, color: C.ink }}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border md:hidden" style={{ background: C.chip, borderColor: C.border }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.id}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex h-11 items-center px-5 text-sm font-medium"
              style={{ color: C.ink, borderBottom: `1px solid ${C.border}` }}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 p-3">
            {isSignedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ background: C.primary }}>
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-xl text-sm font-medium" style={{ color: C.muted, background: C.pill }}>
                  Přihlásit se
                </Link>
                <Link href="/sign-up" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ background: C.primary }}>
                  Začít zdarma →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
