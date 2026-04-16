'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface Props {
  botId: string
}

export function BotcraftWidget({ botId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="AI Asistent"
        className="fixed bottom-5 right-5 z-[9999] h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xl shadow-indigo-200 flex items-center justify-center transition-colors"
      >
        {open
          ? <X className="h-6 w-6" />
          : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel — fullscreen on mobile, floating on desktop */}
      {open && (
        <div className="
          fixed z-[9998]
          inset-0
          md:inset-auto md:bottom-24 md:right-5
          md:w-[380px] md:h-[600px] md:max-h-[80vh]
          md:rounded-2xl md:border md:border-slate-100
          overflow-hidden shadow-2xl bg-white
        ">
          <iframe
            src={`https://botcraft.vercel.app/widget/${botId}`}
            className="w-full h-full border-0"
            allow="microphone"
          />
        </div>
      )}
    </>
  )
}
