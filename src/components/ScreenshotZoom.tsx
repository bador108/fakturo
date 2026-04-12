'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ZoomIn, X } from 'lucide-react'

interface ScreenshotZoomProps {
  src: string
  alt: string
  step?: string
  aspectRatio?: string
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-800 flex items-center gap-2 px-4 py-2.5">
          <button onClick={onClose} className="h-3 w-3 rounded-full bg-red-400 hover:bg-red-500 transition" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 bg-slate-700 rounded-md h-5 flex items-center px-3">
            <span className="text-[10px] text-slate-400 font-mono">fakturo.vercel.app</span>
          </div>
          <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative w-full" style={{ aspectRatio: '1200/836' }}>
          <Image src={src} alt={alt} fill className="object-cover object-top" sizes="100vw" priority />
        </div>
      </div>
    </div>
  )
}

export function ScreenshotZoom({ src, alt, step, aspectRatio = '1200/836' }: ScreenshotZoomProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200 cursor-zoom-in group"
      >
        <div className="bg-slate-800 flex items-center gap-1.5 px-3 py-2 relative">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          {step && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {step}
            </div>
          )}
        </div>
        <div className="relative w-full" style={{ aspectRatio }}>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors flex items-end justify-end p-3">
            <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
              <ZoomIn className="h-3 w-3" />
              Zvětšit
            </span>
          </div>
        </div>
      </button>

      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}
