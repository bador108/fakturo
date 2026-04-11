import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default async function SignInPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="h-16 flex items-center px-8 border-b border-slate-100 bg-white">
        <Link href="/">
          <Image src="/logo.svg" alt="Fakturo" width={110} height={28} />
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Vítejte zpět</h1>
            <p className="text-slate-400 mt-1 text-sm">Přihlaste se ke svému účtu</p>
          </div>
          <SignIn forceRedirectUrl="/dashboard" />
          <p className="text-center text-sm text-slate-400 mt-6">
            Nemáte účet?{' '}
            <Link href="/sign-up" className="text-indigo-600 hover:underline font-medium">
              Zaregistrujte se zdarma
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
