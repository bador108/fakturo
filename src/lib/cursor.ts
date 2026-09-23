export type CursorColor = 'dark' | 'light'

export const CURSOR_COLOR_KEY = 'fakturo-cursor-color'
export const CURSOR_SIZE_KEY = 'fakturo-cursor-size'
export const CURSOR_DEFAULT_COLOR: CursorColor = 'dark'
export const CURSOR_DEFAULT_SIZE = 32
export const CURSOR_MIN_SIZE = 20
export const CURSOR_MAX_SIZE = 64

const PALETTE: Record<CursorColor, { fill: string; stroke: string }> = {
  dark: { fill: '#0c0c0e', stroke: '#fffcf6' },
  light: { fill: '#fffcf6', stroke: '#0c0c0e' },
}

function arrowSvg(color: CursorColor, size: number): string {
  const { fill, stroke } = PALETTE[color]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z" fill="${fill}" stroke="${stroke}" stroke-width="1.75" stroke-linejoin="round"/></svg>`
}

function handSvg(color: CursorColor, size: number): string {
  const { fill, stroke } = PALETTE[color]
  const HAND_OUTLINE = 'M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'
  const CREASES = [
    'M22 14a8 8 0 0 1-8 8',
    'M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2',
    'M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1',
    'M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10',
    HAND_OUTLINE,
  ].map((d) => `<path d="${d}" />`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="${HAND_OUTLINE}V4a2 2 0 0 1 4 0v5.5" fill="${fill}" stroke="none" />
    <g stroke="${stroke}" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round">${CREASES}</g>
    <g stroke="${fill}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${CREASES}</g>
  </svg>`
}

function toDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** Poměr velikosti k originálním 24px podkladům, ze kterých je odvozený hotspot (špička šipky / bod na ukazováku). */
function scaledHotspot(base: number, size: number): number {
  return Math.round((base * size) / 24)
}

export function buildCursorCssVars(color: CursorColor, size: number): { arrow: string; hand: string } {
  // Špička šipky je v path na (4,4) – hotspot musí sedět přesně tam, jinak
  // se klikání "rozjede" od vizuální špičky (uživatel musí mířit vedle).
  const arrowHotspot = scaledHotspot(4, size)
  const handHotspotX = scaledHotspot(8, size)
  const handHotspotY = scaledHotspot(2, size)
  return {
    arrow: `${toDataUri(arrowSvg(color, size))} ${arrowHotspot} ${arrowHotspot}`,
    hand: `${toDataUri(handSvg(color, size))} ${handHotspotX} ${handHotspotY}`,
  }
}

export function applyCursorPreference(color: CursorColor, size: number): void {
  const { arrow, hand } = buildCursorCssVars(color, size)
  document.documentElement.style.setProperty('--cursor-arrow', arrow)
  document.documentElement.style.setProperty('--cursor-hand', hand)
}

export function loadCursorPreference(): { color: CursorColor; size: number } {
  if (typeof window === 'undefined') return { color: CURSOR_DEFAULT_COLOR, size: CURSOR_DEFAULT_SIZE }
  const storedColor = window.localStorage.getItem(CURSOR_COLOR_KEY)
  const storedSize = Number(window.localStorage.getItem(CURSOR_SIZE_KEY))
  return {
    color: storedColor === 'light' ? 'light' : CURSOR_DEFAULT_COLOR,
    size: Number.isFinite(storedSize) && storedSize >= CURSOR_MIN_SIZE && storedSize <= CURSOR_MAX_SIZE ? storedSize : CURSOR_DEFAULT_SIZE,
  }
}

export function saveCursorPreference(color: CursorColor, size: number): void {
  window.localStorage.setItem(CURSOR_COLOR_KEY, color)
  window.localStorage.setItem(CURSOR_SIZE_KEY, String(size))
}
