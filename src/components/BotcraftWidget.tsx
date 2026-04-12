'use client'

import { useEffect } from 'react'

interface Props {
  botId: string
}

export function BotcraftWidget({ botId }: Props) {
  useEffect(() => {
    // Remove any existing Botcraft widget elements injected by a previous page
    document.querySelectorAll('[id^="botcraft"], [class*="botcraft"], iframe[src*="botcraft"]').forEach(el => el.remove())
    // Also remove any lingering script tags for botcraft
    document.querySelectorAll('script[data-bot-id]').forEach(el => el.remove())

    // Load the widget fresh
    const script = document.createElement('script')
    script.src = 'https://botcraft.vercel.app/widget.js'
    script.setAttribute('data-bot-id', botId)
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      script.remove()
      document.querySelectorAll('[id^="botcraft"], [class*="botcraft"], iframe[src*="botcraft"]').forEach(el => el.remove())
    }
  }, [botId])

  return null
}
