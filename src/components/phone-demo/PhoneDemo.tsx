'use client'

import { useRef, type PointerEvent } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { DeviceFrame, DEVICE, type Touch } from './DeviceFrame'
import { DashboardScreen } from './DashboardScreen'
import { FormScreen } from './FormScreen'
import { ListScreen } from './ListScreen'
import { StepRail, StepCaption, InvoicePaper } from './StepRail'
import { useLoopClock, usePageVisible } from '../demo/useLoopClock'
import { LOOP, T, sceneAt, seg, type Scene } from './timeline'

// kam prst ťuká (obrazovka 390×844, px)
const TOUCHES: Touch[] = [
  { at: T.tapMenu, x: 354, y: 75 },
  { at: T.tapNew, x: 144, y: 136 },
  { at: T.icoType[0] - 0.05, x: 113, y: 467 },
  { at: T.tapAres, x: 90, y: 576 },
  { at: T.emailType[0] - 0.05, x: 195, y: 545 },
  { at: T.descType[0] - 0.05, x: 195, y: 220 },
  { at: T.priceType[0] - 0.05, x: 195, y: 360 },
  { at: T.tapSend, x: 201, y: 249 },
  { at: T.tapPush, x: 200, y: 94 },
]

const SLIDE = { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const }
const enter: Record<Scene, { x?: string; opacity?: number; scale?: number }> = {
  dash: { opacity: 0 },
  form: { x: '100%' },
  list: { x: '100%' },
  'dash-paid': { opacity: 0, scale: 1.03 },
}

function Screen({ scene, t }: { scene: Scene; t: number }) {
  if (scene === 'form') return <FormScreen t={t} />
  if (scene === 'list') return <ListScreen t={t} />
  return <DashboardScreen t={t} paid={scene === 'dash-paid'} />
}

export function PhoneDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const reduced = useReducedMotion() ?? false
  const pageVisible = usePageVisible()
  const { t: clock } = useLoopClock(inView && pageVisible && !reduced, LOOP)
  // s omezeným pohybem stojí ukázka na hotovém přehledu
  const t = reduced ? 2 : clock
  const scene = sceneAt(t)
  const fade = seg(t, [0, 0.25]) * (1 - seg(t, T.fadeOut))

  // 3D: náklon podle scrollu + jemně za kurzorem
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scrollRX = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, -10])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [70, 0, -40])
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, v => v * 9), { stiffness: 120, damping: 18 })
  const pointerRX = useSpring(useTransform(py, v => v * -5), { stiffness: 120, damping: 18 })
  const rotateX = useTransform([scrollRX, pointerRX], ([a, b]: number[]) => a + b)
  const sheen = useTransform(scrollYProgress, [0, 1], ['-60%', '160%'])

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width) * 2 - 1)
    py.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { px.set(0); py.set(0) }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-10 lg:gap-14"
    >
      <div className="hidden lg:flex justify-end"><StepRail t={t} still={reduced} /></div>

      <div className="flex flex-col items-center gap-8">
        <div className="relative [--s:0.6] sm:[--s:0.68] lg:[--s:0.72]" style={{ width: `calc(${DEVICE.w}px * var(--s))`, height: `calc(${DEVICE.h}px * var(--s))`, perspective: 1600 }}>
          <span className="absolute -inset-x-16 top-1/4 bottom-0 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
          <motion.div className="absolute inset-0" style={reduced ? undefined : { rotateX, rotateY, y }}>
            <div className="absolute left-0 top-0 origin-top-left" style={{ transform: 'scale(var(--s))' }}>
              <DeviceFrame t={t} touches={reduced ? [] : TOUCHES}>
                <div className="absolute inset-0" style={{ opacity: reduced ? 1 : fade }}>
                  <AnimatePresence initial={false}>
                    <motion.div key={scene} className="absolute inset-0" initial={enter[scene]} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: '-22%', opacity: 0 }} transition={SLIDE}>
                      <Screen scene={scene} t={t} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </DeviceFrame>
              <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[68px]" style={{ background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.10) 50%, transparent 60%)', backgroundSize: '250% 100%', backgroundPositionX: sheen }} />
            </div>
          </motion.div>
        </div>
        <div className="lg:hidden"><StepCaption t={t} /></div>
      </div>

      <div className="hidden lg:flex justify-start"><InvoicePaper t={t} still={reduced} /></div>
    </div>
  )
}
