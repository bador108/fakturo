import { enhanceReceiptPixels, receiptScale } from './receiptImage'
import { parseReceiptText, type ParsedReceipt } from './receiptText'

// iOS Safari neumí canvas nad ~16 M pixelů, ať máme rezervu.
const MAX_PIXELS = 12_000_000

async function drawScaled(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file)
  let scale = receiptScale(bitmap.width)
  const pixels = bitmap.width * scale * bitmap.height * scale
  if (pixels > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / pixels)

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas není dostupný')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

// Přečte fotku účtenky přímo v prohlížeči (Tesseract, čeština + angličtina) — obrázek se
// kvůli tomu nikam neposílá. Nejdřív jen zvětší (malé obrázky se čtou nejlíp takhle), a když
// se nepodaří najít částku, zkusí ještě druhý průchod s ostrým černobílým kontrastem.
export async function readReceiptFile(file: File, onProgress: (progress: number) => void): Promise<ParsedReceipt> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('ces+eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') onProgress(m.progress)
    },
  })

  try {
    const canvas = await drawScaled(file)
    const first = parseReceiptText((await worker.recognize(canvas)).data.text)
    if (first.amount !== null) return first

    const ctx = canvas.getContext('2d')
    if (!ctx) return first
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
    enhanceReceiptPixels(image.data, canvas.width, canvas.height, 'binary')
    ctx.putImageData(image, 0, 0)

    const second = parseReceiptText((await worker.recognize(canvas)).data.text)
    if (second.amount === null) return first
    return { ...second, vendor: second.vendor ?? first.vendor, date: second.date ?? first.date }
  } finally {
    await worker.terminate()
  }
}
