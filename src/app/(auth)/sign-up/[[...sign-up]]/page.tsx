'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useSignUp } from '@clerk/nextjs/legacy'
import { useAuth, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function errMsg(err: unknown): string {
  const e = err as { errors?: { message?: string; longMessage?: string }[]; message?: string }
  return e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? e?.message ?? 'Něco se nepovedlo. Zkuste to znovu.'
}

// Clerkův JS klient si na custom doméně občas nestihne správně dotáhnout skript
// (viditelné jako 400/422 na clerk.<domena>/npm/... v konzoli) přesně ve chvíli, kdy
// má potvrdit dokončení sign-upu — účet/session se přitom na serveru VYTVOŘÍ, jen se
// to nepropíše do UI a zůstane viset generická "No sign up attempt was found" chyba.
// Obyčejný refresh stránku spraví (Clerk si při startu přečte reálnou session cookie),
// takže to samý zkusíme automaticky, ať uživatel nekouká na chybu u hotový registrace.
function looksLikeStaleClientError(message: string): boolean {
  return message.includes('No sign up attempt was found') || message.includes('unable to complete a')
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.57-5.2 3.57-8.84z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 010-4.54V6.62H1.26a12 12 0 000 10.76z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.3 0 3.24 2.7 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  )
}

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { isSignedIn } = useAuth()
  const clerk = useClerk()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) router.replace('/dashboard')
  }, [isSignedIn, router])

  const [pendingVerification, setPendingVerification] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await clerk.client.signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/dashboard',
        oidcPrompt: 'select_account',
      })
    } catch (err) {
      console.error('Google sign-up failed:', err)
      setError(errMsg(err))
      setGoogleLoading(false)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err) {
      console.error('Sign-up failed:', err)
      const msg = errMsg(err)
      if (looksLikeStaleClientError(msg)) {
        setNotice('Chvilku strpení, dokončujeme registraci…')
        window.setTimeout(() => window.location.reload(), 1200)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        setError('Ověření se nepodařilo dokončit. Zkontrolujte kód.')
      }
    } catch (err) {
      console.error('Verification failed:', err)
      const msg = errMsg(err)
      if (looksLikeStaleClientError(msg)) {
        setNotice('Chvilku strpení, dokončujeme registraci…')
        window.setTimeout(() => window.location.reload(), 1200)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="h-16 flex items-center px-8 border-b border-slate-100">
        <Link href="/">
          <Image src="/logo.png" alt="Fakturo" width={159} height={32} />
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {!pendingVerification ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Vytvořte si účet</h1>
                <p className="text-slate-400 mt-1 text-sm">Zdarma · Bez kreditní karty</p>
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition mb-5"
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}
                Pokračovat přes Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">nebo</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vy@firma.cz"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Heslo</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimálně 8 znaků"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                {notice && <p className="text-xs text-emerald-600">{notice}</p>}
                <div id="clerk-captcha" data-cl-theme="light" />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Zaregistrovat se
                </button>
              </form>
              <p className="text-center text-sm text-slate-400 mt-6">
                Již máte účet?{' '}
                <Link href="/sign-in" className="text-slate-900 hover:underline font-medium">
                  Přihlaste se
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Ověřte e-mail</h1>
                <p className="text-slate-400 mt-1 text-sm">Kód jsme poslali na {email}</p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Ověřovací kód</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                {notice && <p className="text-xs text-emerald-600">{notice}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Potvrdit a pokračovat
                </button>
                <button type="button" onClick={() => { setPendingVerification(false); setError(null) }} className="w-full text-center text-sm text-slate-500 hover:text-slate-900">
                  Zpět
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
