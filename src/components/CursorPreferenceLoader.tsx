'use client'

import { useEffect } from 'react'
import { applyCursorPreference, loadCursorPreference } from '@/lib/cursor'

/** Bez viditelného výstupu – jen při načtení stránky aplikuje uloženou barvu/velikost kurzoru. */
export function CursorPreferenceLoader() {
  useEffect(() => {
    const { color, size } = loadCursorPreference()
    applyCursorPreference(color, size)
  }, [])

  return null
}
