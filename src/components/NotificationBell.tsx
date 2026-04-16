'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => setNotifications(d ?? [])).catch(() => {})
  }, [])

  const updatePos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    // Place panel below the button, aligned to its right edge (but keep within viewport)
    const panelWidth = 320
    let left = rect.right - panelWidth
    if (left < 8) left = 8
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8
    setPos({ top: rect.bottom + 8, left })
  }, [])

  function toggle() {
    if (!open) updatePos()
    setOpen(o => !o)
  }

  // Close on outside click/touch
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = 'touches' in e ? e.touches[0]?.target : (e.target as Node)
      if (
        btnRef.current?.contains(target as Node) ||
        panelRef.current?.contains(target as Node)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler as EventListener)
    document.addEventListener('touchstart', handler as EventListener, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handler as EventListener)
      document.removeEventListener('touchstart', handler as EventListener)
    }
  }, [open])

  // Close on scroll / resize
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ readAll: true }) })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="w-[calc(100vw-16px)] max-w-[320px] bg-white rounded-xl border border-slate-100 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <span className="text-sm font-semibold text-slate-800">Oznámení</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">
                Označit vše jako přečtené
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Žádná oznámení
              </div>
            ) : (
              notifications.slice(0, 15).map(n => (
                <div
                  key={n.id}
                  className={cn('px-4 py-3', !n.read && 'bg-indigo-50/40')}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      'mt-1 h-2 w-2 rounded-full shrink-0',
                      n.type === 'overdue' ? 'bg-red-400' :
                      n.type === 'reminder' ? 'bg-amber-400' :
                      n.type === 'paid' ? 'bg-emerald-400' : 'bg-slate-300'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      {n.invoice_id && (
                        <Link
                          href={`/invoices/${n.invoice_id}`}
                          onClick={() => setOpen(false)}
                          className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                        >
                          Zobrazit fakturu →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
