'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Čas animované ukázky v sekundách (dokola 0 → loop). Běží jen když je `running`,
 * mimo obrazovku nebo na skryté záložce stojí. `seek` skočí na daný čas (klik v menu).
 */
export function useLoopClock(running: boolean, loop: number): { t: number; seek: (to: number) => void } {
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
        setT(elapsed.current % loop)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, loop])

  const seek = useCallback((to: number) => {
    elapsed.current = to
    setT(to % loop)
  }, [loop])

  return { t, seek }
}

/** Stojí stránka na skryté záložce? */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}
