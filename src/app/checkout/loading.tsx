import { Loader2 } from 'lucide-react'

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
        <p className="text-slate-700 font-medium">Připravujeme platbu…</p>
        <p className="text-sm text-slate-400 mt-1">Za chvíli budete přesměrováni do Stripe</p>
      </div>
    </div>
  )
}
