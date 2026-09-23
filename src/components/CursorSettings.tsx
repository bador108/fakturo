'use client'

import { useEffect, useState } from 'react'
import {
  applyCursorPreference,
  loadCursorPreference,
  saveCursorPreference,
  CURSOR_MIN_SIZE,
  CURSOR_MAX_SIZE,
  type CursorColor,
} from '@/lib/cursor'

export function CursorSettings() {
  const [color, setColor] = useState<CursorColor>('dark')
  const [size, setSize] = useState(32)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const pref = loadCursorPreference()
    setColor(pref.color)
    setSize(pref.size)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    applyCursorPreference(color, size)
    saveCursorPreference(color, size)
  }, [color, size, ready])

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Kurzor se mění rovnou — přejeďte myší po stránce a uvidíte.</p>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-2">Barva</p>
        <div className="flex gap-2">
          {([
            ['dark', 'Černý'],
            ['light', 'Bílý'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setColor(value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition ${
                color === value
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-slate-600">Velikost</p>
          <span className="text-xs text-slate-400">{size}px</span>
        </div>
        <input
          type="range"
          min={CURSOR_MIN_SIZE}
          max={CURSOR_MAX_SIZE}
          step={2}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full accent-brand"
        />
      </div>
    </div>
  )
}
