'use client'

import { useEffect, useRef, useState } from 'react'
import { LOOP } from './timeline'

/**
 * Čas ukázky v sekundách (dokola 0 → LOOP). Běží jen když je `running` —
 * mimo obrazovku nebo na skryté záložce stojí a nic nepočítá.
 */
export function useDemoClock(running: boolean): number {
  const [t, setT] = useState(0)
  const elapsed = useRef(0)

  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    let lastPaint = 0
    const tick = (now: number) => {
      // po návratu na záložku nedoháníme ztracený čas
      elapsed.current += Math.min(now - last, 100) / 1000
      last = now
      // ~40 fps stačí a šetří re-rendery
      if (now - lastPaint > 24) {
        lastPaint = now
        setT(elapsed.current % LOOP)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  return t
}
