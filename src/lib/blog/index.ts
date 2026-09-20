import type { Post } from './types'
import { nalezitostiFaktury } from './posts/nalezitosti-faktury'
import { fakturaNeplatceDph } from './posts/faktura-neplatce-dph'
import { kdyStatPlatcemDph } from './posts/kdy-se-stat-platcem-dph'
import { upominkaNezaplacenaFaktura } from './posts/upominka-nezaplacena-faktura'
import { zalohovaFaktura } from './posts/zalohova-faktura-nebo-danovy-doklad'
import { qrPlatba } from './posts/qr-platba-na-fakture'
import { vydajeOsvc } from './posts/vydaje-osvc-a-uctenky'
import { pravidelnaFakturace } from './posts/pravidelna-fakturace'

export const posts: Post[] = [
  nalezitostiFaktury,
  fakturaNeplatceDph,
  kdyStatPlatcemDph,
  upominkaNezaplacenaFaktura,
  zalohovaFaktura,
  qrPlatba,
  vydajeOsvc,
  pravidelnaFakturace,
]

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}

function stripInline(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

export function readingMinutes(post: Post): number {
  const words = post.blocks
    .map(b => {
      if (b.t === 'ul' || b.t === 'ol') return b.items.join(' ')
      if (b.t === 'tip') return `${b.title} ${b.text}`
      return b.text
    })
    .map(stripInline)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(2, Math.round(words / 190))
}

const MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']

export function formatBlogDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d}. ${MONTHS[m - 1]} ${y}`
}
