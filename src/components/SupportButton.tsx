'use client'

import { useState } from 'react'
import { HelpCircle, X, Mail, Lightbulb, MessageSquare } from 'lucide-react'

export function SupportButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-14 right-0 w-64 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden mb-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <span className="text-sm font-semibold text-slate-800">Podpora</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-2 space-y-1">
            <a
              href="mailto:podpora@fakturo.cz"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Napsat podporu</p>
                <p className="text-xs text-slate-400">podpora@fakturo.cz</p>
              </div>
            </a>
            <a
              href="mailto:napad@fakturo.cz?subject=Nápad na zlepšení Fakturo"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <Lightbulb className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Navrhnout zlepšení</p>
                <p className="text-xs text-slate-400">Váš nápad nás posouvá dál</p>
              </div>
            </a>
            <a
              href="mailto:zpetna-vazba@fakturo.cz?subject=Zpětná vazba"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Zpětná vazba</p>
                <p className="text-xs text-slate-400">Řekněte nám co si myslíte</p>
              </div>
            </a>
          </div>
          <div className="px-4 py-3 border-t border-slate-50">
            <p className="text-xs text-slate-400 text-center">Odpovídáme do 24 hodin</p>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition"
        title="Podpora"
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>
    </div>
  )
}
