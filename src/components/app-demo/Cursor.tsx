import { easeInOut } from './timeline'

type Pt = readonly [number, number]
export type Key = readonly [time: number, at: Pt, hand?: boolean]

// hotspoty stejné jako v globals.css (--cursor-arrow 5 5, --cursor-hand 11 3)
const HOT = { arrow: [5, 5], hand: [11, 3] } as const

/** Poloha kurzoru mezi klíčovými body (mezi dvěma body se plynule přesouvá) */
export function cursorAt(keys: readonly Key[], t: number): { x: number; y: number; hand: boolean; target: Pt } {
  let i = keys.length - 1
  for (let j = 0; j < keys.length - 1; j++) if (t < keys[j + 1][0]) { i = j; break }
  const a = keys[i]
  const b = keys[Math.min(i + 1, keys.length - 1)]
  const p = b[0] > a[0] ? easeInOut(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])))) : 1
  return {
    x: a[1][0] + (b[1][0] - a[1][0]) * p,
    y: a[1][1] + (b[1][1] - a[1][1]) * p,
    hand: Boolean(p > 0.7 ? b[2] : a[2]),
    target: p > 0.7 ? b[1] : a[1],
  }
}

export function Cursor({ keys, clicks, t }: { keys: readonly Key[]; clicks: readonly number[]; t: number }) {
  const { x, y, hand } = cursorAt(keys, t)
  const click = clicks.find(c => t >= c && t < c + 0.45)
  const pressed = click !== undefined && t < click + 0.12
  const [hx, hy] = hand ? HOT.hand : HOT.arrow
  return (
    <>
      {click !== undefined && (
        <span
          className="absolute z-40 h-10 w-10 -ml-5 -mt-5 rounded-full border-2 border-emerald-500/60"
          style={{ left: x, top: y, opacity: 1 - (t - click) / 0.45, transform: `scale(${0.4 + ((t - click) / 0.45) * 0.9})` }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hand ? '/cursor-hand.svg' : '/cursor-arrow.svg'}
        alt=""
        width={32}
        height={32}
        className="absolute z-50 pointer-events-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
        style={{ left: x - hx, top: y - hy, transform: `scale(${pressed ? 0.88 : 1})`, transformOrigin: `${hx}px ${hy}px` }}
      />
    </>
  )
}
