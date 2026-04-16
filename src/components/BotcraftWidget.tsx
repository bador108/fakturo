'use client'

import { useEffect } from 'react'

interface Props {
  botId: string
}

export function BotcraftWidget({ botId }: Props) {
  useEffect(() => {
    document.querySelectorAll('[id^="botcraft"], [class*="botcraft"], iframe[src*="botcraft"]').forEach(el => el.remove())
    document.querySelectorAll('script[data-bot-id]').forEach(el => el.remove())

    const script = document.createElement('script')
    script.src = 'https://botcraft.vercel.app/widget.js'
    script.setAttribute('data-bot-id', botId)
    script.async = true
    document.body.appendChild(script)

    // Na mobilu sledujeme DOM a opravíme výšku kontejneru a iframe
    const isMobile = window.innerWidth < 768
    let observer: MutationObserver | null = null

    if (isMobile) {
      const fixSizes = () => {
        // Oprav všechny botcraft kontejnery
        document.querySelectorAll<HTMLElement>('[id^="botcraft"], [class*="botcraft"]').forEach(el => {
          if (el.tagName === 'SCRIPT') return
          const style = window.getComputedStyle(el)
          if (style.position === 'fixed') {
            el.style.setProperty('height', '100dvh', 'important')
            el.style.setProperty('max-height', '100dvh', 'important')
            el.style.setProperty('top', '0', 'important')
            el.style.setProperty('bottom', '0', 'important')
          }
        })
        // Oprav iframe uvnitř widgetu
        document.querySelectorAll<HTMLElement>('iframe[src*="botcraft"]').forEach(iframe => {
          iframe.style.setProperty('height', '100%', 'important')
          iframe.style.setProperty('min-height', '300px', 'important')
          iframe.style.setProperty('width', '100%', 'important')
        })
      }

      observer = new MutationObserver(fixSizes)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] })
    }

    return () => {
      observer?.disconnect()
      script.remove()
      document.querySelectorAll('[id^="botcraft"], [class*="botcraft"], iframe[src*="botcraft"]').forEach(el => el.remove())
    }
  }, [botId])

  return null
}
