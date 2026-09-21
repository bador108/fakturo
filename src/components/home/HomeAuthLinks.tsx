'use client'

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

// Úvodní stránka je statická (na serveru se neví, kdo se dívá), takže se stav přihlášení řeší až
// v prohlížeči. Než se Clerk načte, návštěvník vidí variantu pro nepřihlášené.

const LIFT = 'transition-transform duration-150 ease-out hover:-translate-y-0.5'

export function NavActions({ primaryStyle, linkStyle }: { primaryStyle: CSSProperties; linkStyle: CSSProperties }) {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Link href="/dashboard" className={LIFT} style={primaryStyle}>Dashboard →</Link>
  }
  return (
    <>
      <Link href="/sign-in" className="hidden md:inline-block" style={linkStyle}>Přihlásit se</Link>
      <Link href="/sign-up" className={LIFT} style={primaryStyle}>Začít →</Link>
    </>
  )
}

export function AuthLink({ style, signedOutLabel, signedInLabel }: { style: CSSProperties; signedOutLabel: ReactNode; signedInLabel: ReactNode }) {
  const { isSignedIn } = useAuth()

  return (
    <Link href={isSignedIn ? '/dashboard' : '/sign-up'} className={LIFT} style={style}>
      {isSignedIn ? signedInLabel : signedOutLabel}
    </Link>
  )
}
