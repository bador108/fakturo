'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useSignIn, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function errMsg(error: { message?: string; longMessage?: string } | null): string | null {
  if (!error) return null
  return error.longMessage ?? error.message ?? 'Něco se nepovedlo. Zkuste to znovu.'
}

type Mode = 'sign-in' | 'forgot-request' | 'forgot-verify'

export default function SignInPage() {
  const { signIn } = useSignIn()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) router.replace('/dashboard')
  }, [isSignedIn, router])

  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await signIn.password({ password, identifier: email })
      if (err) {
        setError(errMsg(err))
        return
      }
      if (signIn.status === 'complete') {
        await signIn.finalize()
        router.push('/dashboard')
      } else {
        setError('Přihlášení vyžaduje další krok, který zatím nepodporujeme. Kontaktujte podporu.')
      }
    } catch (err) {
      setError(errMsg(err as { message?: string }))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotRequest(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: createErr } = await signIn.create({ identifier: email })
      if (createErr) {
        setError(errMsg(createErr))
        return
      }
      const { error: sendErr } = await signIn.resetPasswordEmailCode.sendCode()
      if (sendErr) {
        setError(errMsg(sendErr))
        return
      }
      setMode('forgot-verify')
    } catch (err) {
      setError(errMsg(err as { message?: string }))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotVerify(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: verifyErr } = await signIn.resetPasswordEmailCode.verifyCode({ code })
      if (verifyErr) {
        setError(errMsg(verifyErr))
        return
      }
      const { error: submitErr } = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword })
      if (submitErr) {
        setError(errMsg(submitErr))
        return
      }
      if (signIn.status === 'complete') {
        await signIn.finalize()
        router.push('/dashboard')
      } else {
        setError('Nepodařilo se dokončit reset hesla. Zkuste to znovu.')
      }
    } catch (err) {
      setError(errMsg(err as { message?: string }))
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
          {mode === 'sign-in' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Vítejte zpět</h1>
                <p className="text-slate-400 mt-1 text-sm">Přihlaste se ke svému účtu</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-600">Heslo</label>
                    <button type="button" onClick={() => { setMode('forgot-request'); setError(null) }} className="text-xs text-slate-500 hover:text-slate-900 hover:underline">
                      Zapomenuté heslo?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Přihlásit se
                </button>
              </form>
              <p className="text-center text-sm text-slate-400 mt-6">
                Nemáte účet?{' '}
                <Link href="/sign-up" className="text-slate-900 hover:underline font-medium">
                  Zaregistrujte se zdarma
                </Link>
              </p>
            </>
          )}

          {mode === 'forgot-request' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Obnovit heslo</h1>
                <p className="text-slate-400 mt-1 text-sm">Pošleme vám ověřovací kód na e-mail</p>
              </div>
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vy@firma.cz"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Poslat kód
                </button>
                <button type="button" onClick={() => { setMode('sign-in'); setError(null) }} className="w-full text-center text-sm text-slate-500 hover:text-slate-900">
                  Zpět na přihlášení
                </button>
              </form>
            </>
          )}

          {mode === 'forgot-verify' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Nové heslo</h1>
                <p className="text-slate-400 mt-1 text-sm">Kód jsme poslali na {email}</p>
              </div>
              <form onSubmit={handleForgotVerify} className="space-y-4">
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
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Nové heslo</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Nastavit heslo a přihlásit
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
