// Úprava fotky účtenky před čtením (Tesseract): zvětšení malých obrázků, vyhození barevných
// poznámek, srovnání kontrastu a volitelně ostré černobílé zobrazení. Čistá funkce nad pixely,
// ať jde spustit v prohlížeči (canvas) i v testech.

export type EnhanceMode = 'gray' | 'binary'

// Tesseract potřebuje písmo vysoké aspoň ~25 px; malé screenshoty tedy zvětšíme, obří fotky zmenšíme.
export function receiptScale(width: number): number {
  if (width < 1500) return Math.min(4, 1500 / width)
  if (width > 2400) return 2000 / width
  return 1
}

export function enhanceReceiptPixels(data: Uint8ClampedArray | Uint8Array, w: number, h: number, mode: EnhanceMode): void {
  const n = w * h

  // Nejjasnější z kanálů R/G/B: černý text zůstane černý, ale červená/zelená/modrá propiska
  // nebo zvýrazňovač zbělá a při čtení zmizí.
  const gray = new Uint8Array(n)
  const hist = new Uint32Array(256)
  for (let i = 0; i < n; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const v = r > g ? (r > b ? r : b) : (g > b ? g : b)
    gray[i] = v
    hist[v]++
  }

  // Roztažení kontrastu podle percentilů (ignoruje pár extrémních pixelů).
  let lo = 0
  let hi = 255
  let acc = 0
  for (let v = 0; v < 256; v++) {
    acc += hist[v]
    if (acc >= n * 0.005) { lo = v; break }
  }
  acc = 0
  for (let v = 0; v < 256; v++) {
    acc += hist[v]
    if (acc >= n * 0.995) { hi = v; break }
  }
  if (hi - lo < 30) { lo = 0; hi = 255 }
  const gain = 255 / (hi - lo)
  for (let i = 0; i < n; i++) {
    const v = (gray[i] - lo) * gain
    gray[i] = v < 0 ? 0 : v > 255 ? 255 : v
  }

  const out: Uint8Array = mode === 'binary' ? adaptiveThreshold(gray, w, h) : gray

  for (let i = 0; i < n; i++) {
    const v = out[i]
    data[i * 4] = v
    data[i * 4 + 1] = v
    data[i * 4 + 2] = v
    data[i * 4 + 3] = 255
  }
}

// Práh podle okolí (integrální obraz) — zvládne stíny a nerovnoměrné světlo na fotce.
function adaptiveThreshold(gray: Uint8Array, w: number, h: number): Uint8Array {
  const stride = w + 1
  const integral = new Uint32Array(stride * (h + 1))
  for (let y = 0; y < h; y++) {
    let rowSum = 0
    for (let x = 0; x < w; x++) {
      rowSum += gray[y * w + x]
      integral[(y + 1) * stride + (x + 1)] = integral[y * stride + (x + 1)] + rowSum
    }
  }

  const r = Math.max(8, Math.round(w / 30))
  const out = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r)
    const y1 = Math.min(h - 1, y + r)
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r)
      const x1 = Math.min(w - 1, x + r)
      const area = (x1 - x0 + 1) * (y1 - y0 + 1)
      const sum =
        integral[(y1 + 1) * stride + (x1 + 1)] - integral[y0 * stride + (x1 + 1)] -
        integral[(y1 + 1) * stride + x0] + integral[y0 * stride + x0]
      const mean = sum / area
      const v = gray[y * w + x]
      out[y * w + x] = v > 200 || v >= mean * 0.85 ? 255 : 0
    }
  }
  return out
}
