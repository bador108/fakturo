export default function Loading() {
  return (
    <div className="space-y-8 max-w-5xl animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-slate-200 rounded-lg" />
          <div className="h-4 w-56 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="h-9 w-9 bg-slate-100 rounded-xl" />
            <div className="h-7 w-20 bg-slate-200 rounded-lg" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter tabs */}
        <div className="flex gap-1 px-4 pt-4 pb-0 border-b border-slate-100">
          {[80, 64, 72, 96, 60].map((w, i) => (
            <div key={i} className={`h-8 rounded-t-lg bg-slate-100`} style={{ width: w }} />
          ))}
        </div>
        {/* Search bar */}
        <div className="px-4 py-3 border-b border-slate-50">
          <div className="h-9 w-full bg-slate-50 rounded-lg border border-slate-100" />
        </div>
        {/* Rows */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-0">
            <div className="h-9 w-9 bg-slate-100 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-44 bg-slate-200 rounded" />
              <div className="h-3 w-64 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-5 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
