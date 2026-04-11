export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-zinc-200 rounded-lg" />
          <div className="h-4 w-48 bg-zinc-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-zinc-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200 p-5 space-y-2">
            <div className="h-3 w-24 bg-zinc-100 rounded" />
            <div className="h-8 w-16 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <div className="h-5 w-20 bg-zinc-200 rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-zinc-200 rounded" />
              <div className="h-3 w-32 bg-zinc-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-zinc-100 rounded-full" />
            <div className="h-4 w-24 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
