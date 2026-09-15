'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastKind = 'error' | 'success'
interface ToastItem { id: number; kind: ToastKind; message: string }

interface ToastContextValue {
  showError: (message: string) => void
  showSuccess: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, kind, message }])
    setTimeout(() => dismiss(id), 6000)
  }, [dismiss])

  const showError = useCallback((message: string) => push('error', message), [push])
  const showSuccess = useCallback((message: string) => push('success', message), [push])

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            role="alert"
            className={`flex items-start gap-3 rounded-xl border bg-white shadow-lg px-4 py-3.5 animate-[toast-in_0.2s_cubic-bezier(0.16,1,0.3,1)_both] ${
              t.kind === 'error' ? 'border-red-100' : 'border-emerald-100'
            }`}
          >
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${t.kind === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {t.kind === 'error'
                ? <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            </div>
            <p className="text-sm text-slate-700 flex-1 leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-slate-300 hover:text-slate-600 shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast musí být použito uvnitř <ToastProvider>')
  return ctx
}
