'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function BotcraftWidget({ botId }: { botId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="AI Asistent"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#6366f1',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
        }}
      >
        {open
          ? <X style={{ color: 'white', width: 24, height: 24 }} />
          : <MessageCircle style={{ color: 'white', width: 24, height: 24 }} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          background: 'white',
        }}>
          <iframe
            src={`https://botcraft.vercel.app/widget/${botId}`}
            allow="microphone"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </div>
      )}
    </>
  )
}
