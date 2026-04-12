'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => setNotifications(d ?? [])).catch(() => {})
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ readAll: true }) })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
      >
        <Bell className="h-4.5 w-4.5 h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 bg-white rounded-xl border border-slate-100 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <span className="text-sm font-semibold text-slate-800">Oznámení</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">
                Označit vše jako přečtené
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
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
                      'mt-0.5 h-2 w-2 rounded-full shrink-0',
                      n.type === 'overdue' ? 'bg-red-400' :
                      n.type === 'reminder' ? 'bg-amber-400' :
                      n.type === 'paid' ? 'bg-emerald-400' : 'bg-slate-300'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
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
    </div>
  )
}
