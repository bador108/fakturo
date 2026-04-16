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

    return () => {
      script.remove()
      document.querySelectorAll('[id^="botcraft"], [class*="botcraft"], iframe[src*="botcraft"]').forEach(el => el.remove())
    }
  }, [botId])

  return null
}
