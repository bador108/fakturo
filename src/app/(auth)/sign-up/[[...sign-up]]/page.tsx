'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useSignUp, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function errMsg(error: { message?: string; longMessage?: string } | null): string | null {
  if (!error) return null
  return error.longMessage ?? error.message ?? 'Něco se nepovedlo. Zkuste to znovu.'
}

export default function SignUpPage() {
  const { signUp } = useSignUp()
  const { isSignedIn } = useAuth()
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
  const [error, setError] = useState<string | null>(null)

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: passErr } = await signUp.password({ emailAddress: email, password })
      if (passErr) {
        setError(errMsg(passErr))
        return
      }
      const { error: sendErr } = await signUp.verifications.sendEmailCode()
      if (sendErr) {
        setError(errMsg(sendErr))
        return
      }
      setPendingVerification(true)
    } catch (err) {
      setError(errMsg(err as { message?: string }))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code })
      if (verifyErr) {
        setError(errMsg(verifyErr))
        return
      }
      if (signUp.status === 'complete') {
        await signUp.finalize()
        router.push('/dashboard')
      } else {
        setError('Ověření se nepodařilo dokončit. Zkontrolujte kód.')
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
          {!pendingVerification ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Vytvořte si účet</h1>
                <p className="text-slate-400 mt-1 text-sm">Zdarma · Bez kreditní karty</p>
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
