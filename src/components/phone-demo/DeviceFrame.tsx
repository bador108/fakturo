import Image from 'next/image'
import type { ReactNode } from 'react'
import { T, seg, easeOut } from './timeline'

// Telefon kreslený v plné velikosti obrazovky 390×844 (jako skutečný mobil),
// zmenšuje ho až obal přes --s, takže appka uvnitř má svoje skutečné rozměry.
export const DEVICE = { w: 422, h: 876 }

function StatusBar() {
  return (
    <div className="absolute top-0 inset-x-0 h-[47px] z-30 flex items-center justify-between px-[34px] pt-1 text-slate-900">
      <span className="text-[16px] font-semibold tracking-tight">9:41</span>
      <span className="flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.5 10.5 0 0 0 8.5.6 10.5 10.5 0 0 0 1 3.6l1.2 1.2A8.8 8.8 0 0 1 8.5 2.3Zm0 3.4c1.5 0 2.9.6 3.9 1.5l1.2-1.2a7.2 7.2 0 0 0-10.2 0l1.2 1.2c1-.9 2.4-1.5 3.9-1.5Zm0 3.4c.6 0 1.2.2 1.6.6L8.5 11.3 6.9 9.7c.4-.4 1-.6 1.6-.6Z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.35" /><rect x="2" y="2" width="18" height="9" rx="2" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" fillOpacity="0.4" /></svg>
      </span>
    </div>
  )
}

/** iOS notifikace o přijaté platbě */
function PaymentBanner({ t }: { t: number }) {
  const inP = easeOut(seg(t, [T.push[0], T.push[0] + 0.45]))
  const outP = seg(t, [T.tapPush + 0.05, T.toDash])
  if (inP <= 0 || outP >= 1) return null
  return (
    <div
      className="absolute left-2 right-2 top-[54px] z-40 rounded-[22px] bg-white/85 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.18)] px-3.5 py-3 flex gap-3"
      style={{ transform: `translateY(${(inP - 1) * 130}%) scale(${1 - outP * 0.08})`, opacity: 1 - outP }}
    >
      <Image src="/checkout-icon.png" alt="" width={38} height={38} className="rounded-[9px] border border-slate-100 shrink-0" />
      <div className="flex-1 min-w-0 leading-tight">
        <div className="flex justify-between text-[13px]"><span className="font-semibold text-slate-900">Fakturo</span><span className="text-slate-400">teď</span></div>
        <p className="text-[13px] font-semibold text-slate-900 mt-0.5">Platba přijata · +24 850,00 Kč</p>
        <p className="text-[13px] text-slate-600">Studio Pixel s.r.o. zaplatil fakturu 2026/042</p>
      </div>
    </div>
  )
}

// dotyky prstu (souřadnice v obrazovce 390×844)
export interface Touch { at: number; x: number; y: number }

function TouchDots({ t, touches }: { t: number; touches: Touch[] }) {
  return (
    <>
      {touches.map(({ at, x, y }) => {
        const p = seg(t, [at - 0.28, at + 0.32])
        if (p <= 0 || p >= 1) return null
        const press = t >= at && t < at + 0.12
        const show = p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55
        return (
          <span
            key={at}
            className="absolute z-50 h-11 w-11 -ml-[22px] -mt-[22px] rounded-full border-2 border-white/80 bg-slate-900/25 shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
            style={{ left: x, top: y, opacity: show, transform: `scale(${press ? 0.8 : 1})` }}
          />
        )
      })}
    </>
  )
}

export function DeviceFrame({ t, touches, children }: { t: number; touches: Touch[]; children: ReactNode }) {
  return (
    <div className="relative rounded-[68px] p-1" style={{ width: DEVICE.w, height: DEVICE.h, background: 'linear-gradient(145deg,#4a4a50 0%,#17171a 38%,#2c2c31 70%,#101012 100%)' }}>
      {/* boční tlačítka */}
      <span className="absolute -left-[3px] top-[150px] h-8 w-[4px] rounded-l bg-[#2a2a2e]" />
      <span className="absolute -left-[3px] top-[210px] h-[62px] w-[4px] rounded-l bg-[#2a2a2e]" />
      <span className="absolute -left-[3px] top-[285px] h-[62px] w-[4px] rounded-l bg-[#2a2a2e]" />
      <span className="absolute -right-[3px] top-[240px] h-[100px] w-[4px] rounded-r bg-[#2a2a2e]" />
      <div className="h-full w-full rounded-[64px] bg-black p-3">
        <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[54px] bg-paper" aria-hidden>
          {children}
          <StatusBar />
          <PaymentBanner t={t} />
          <span className="absolute top-[11px] left-1/2 -translate-x-1/2 z-50 h-[36px] w-[124px] rounded-full bg-black" />
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 h-[5px] w-[134px] rounded-full bg-slate-900/80" />
          <TouchDots t={t} touches={touches} />
        </div>
      </div>
    </div>
  )
}
