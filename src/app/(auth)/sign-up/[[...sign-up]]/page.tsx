import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">Fakturo</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Vytvořte si účet zdarma</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
