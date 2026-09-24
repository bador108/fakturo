import Image from 'next/image'
import { Check, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOOP, STEPS, T, seg, easeOut, stepAt } from './timeline'

/** Kroky vlevo od telefonu — aktivní krok má průběh podle času ukázky */
export function StepRail({ t, still }: { t: number; still: boolean }) {
  const step = stepAt(t)
  return (
    <ol className="space-y-8 max-w-[260px]">
      {STEPS.map((s, i) => {
        const next = STEPS[i + 1]?.from ?? LOOP
        const active = !still && i === step
        const p = still ? 0 : i < step ? 1 : active ? seg(t, [s.from, next]) : 0
        return (
          <li key={s.title} className="relative pl-6">
            <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-slate-200 overflow-hidden">
              <span className="block w-full rounded-full bg-slate-900" style={{ height: `${p * 100}%` }} />
            </span>
            <p className={cn('text-lg font-semibold tracking-tight transition-colors duration-300', active || still ? 'text-slate-900' : 'text-slate-400')}>{s.title}</p>
            <p className={cn('text-sm leading-relaxed mt-1 transition-colors duration-300', active || still ? 'text-slate-600' : 'text-slate-400')}>{s.text}</p>
          </li>
        )
      })}
    </ol>
  )
}

/** Popisek pod telefonem na mobilu (kroky vedle se tam nevejdou) */
export function StepCaption({ t }: { t: number }) {
  const s = STEPS[stepAt(t)]
  return (
    <div className="text-center max-w-xs mx-auto min-h-[72px]">
      <p className="text-base font-semibold text-slate-900">{s.title}</p>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{s.text}</p>
    </div>
  )
}

/** Skutečná faktura (vyrenderovaná z PDF šablony appky), která odchází klientovi */
export function InvoicePaper({ t, still }: { t: number; still: boolean }) {
  const inP = still ? 1 : easeOut(seg(t, [T.toList, T.toList + 0.8]))
  const out = still ? 0 : seg(t, T.fadeOut)
  const paid = still || t >= T.paid
  return (
    <div
      className="relative w-[300px] xl:w-[330px]"
      style={{ opacity: inP * (1 - out), transform: `perspective(1400px) translateX(${(1 - inP) * -60}px) rotateY(-14deg) rotateZ(2deg)` }}
    >
      <div className="rounded-lg bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_60px_rgba(15,15,30,0.12)] overflow-hidden">
        <Image src="/landing/faktura-2026-042.webp" alt="Faktura 2026/042 pro Studio Pixel s.r.o. vystavená ve Fakturu, s QR platbou" width={900} height={878} className="w-full h-auto" />
      </div>
      <span className={cn(
        'absolute -top-3 left-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors duration-300',
        paid ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white',
      )}>
        {paid ? <><Check className="h-3.5 w-3.5" />Zaplaceno · spárováno s VS 2026042</> : <><Send className="h-3.5 w-3.5" />PDF odesláno klientovi</>}
      </span>
    </div>
  )
}
