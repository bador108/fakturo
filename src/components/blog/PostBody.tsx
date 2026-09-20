import { Fragment } from 'react'
import Link from 'next/link'
import type { Block } from '@/lib/blog/types'

const C = {
  fg: '#0c0c0e', fg2: '#1f1f23', muted: '#6b7280', border: '#ececef', primary: '#16a34a', soft: '#fafafa',
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/)
        if (bold) return <strong key={i} style={{ fontWeight: 600, color: C.fg }}>{bold[1]}</strong>
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) {
          return (
            <Link key={i} href={link[2]} style={{ color: C.primary, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {link[1]}
            </Link>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

const bodyText = { fontSize: 17, lineHeight: 1.75, color: C.fg2 } as const

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.t) {
          case 'h2':
            return (
              <h2 key={i} style={{ fontSize: 28, fontWeight: 600, letterSpacing: -1, lineHeight: 1.2, color: C.fg, margin: '48px 0 16px' }}>
                {block.text}
              </h2>
            )
          case 'p':
            return <p key={i} style={{ ...bodyText, margin: '0 0 20px' }}><Inline text={block.text} /></p>
          case 'ul':
            return (
              <ul key={i} style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: 10 }}>
                {block.items.map((item, j) => (
                  <li key={j} style={{ ...bodyText, display: 'flex', gap: 14 }}>
                    <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: C.primary, flexShrink: 0, marginTop: 12 }} />
                    <span><Inline text={item} /></span>
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: 12 }}>
                {block.items.map((item, j) => (
                  <li key={j} style={{ ...bodyText, display: 'flex', gap: 14 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 26, height: 26, borderRadius: 999, background: C.fg, color: '#fff', fontSize: 13,
                        fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                      }}
                    >
                      {j + 1}
                    </span>
                    <span><Inline text={item} /></span>
                  </li>
                ))}
              </ol>
            )
          case 'quote':
            return (
              <blockquote
                key={i}
                style={{ ...bodyText, margin: '0 0 24px', padding: '20px 24px', background: C.soft, borderLeft: `3px solid ${C.primary}`, borderRadius: '0 12px 12px 0' }}
              >
                <Inline text={block.text} />
              </blockquote>
            )
          case 'tip':
            return (
              <aside
                key={i}
                style={{ margin: '40px 0 8px', padding: '22px 24px', borderRadius: 14, background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.22)' }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: C.fg, marginBottom: 6 }}>{block.title}</div>
                <p style={{ ...bodyText, fontSize: 16, margin: 0 }}><Inline text={block.text} /></p>
              </aside>
            )
        }
      })}
    </div>
  )
}
