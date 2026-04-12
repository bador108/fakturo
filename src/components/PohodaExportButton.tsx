'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export function PohodaExportButton() {
  const [year, setYear] = useState(new Date().getFullYear())

  function download() {
    window.location.href = `/api/export/pohoda?year=${year}`
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={year}
        onChange={e => setYear(Number(e.target.value))}
        className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <button
        onClick={download}
        className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium px-3.5 py-1.5 rounded-lg transition shadow-sm"
      >
        <Download className="h-4 w-4 text-slate-500" />
        Export Pohoda XML
      </button>
    </div>
  )
}
