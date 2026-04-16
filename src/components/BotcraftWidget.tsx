'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface Props {
  botId: string
}

function DesktopWidget({ botId }: Props) {
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

function MobileWidget({ botId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-50 h-14 w-14 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full shadow-xl shadow-indigo-200 flex items-center justify-center"
        aria-label="AI Asistent"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-800">AI Asistent</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <iframe
            src={`https://botcraft.vercel.app/chat/${botId}`}
            className="flex-1 w-full border-0"
            allow="microphone"
          />
        </div>
      )}
    </>
  )
}

export function BotcraftWidget({ botId }: Props) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (isMobile === null) return null
  if (isMobile) return <MobileWidget botId={botId} />
  return <DesktopWidget botId={botId} />
}
