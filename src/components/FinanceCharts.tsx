'use client'

interface MonthBar {
  label: string
  revenue: number
  expenses: number
}

interface CategorySlice {
  label: string
  amount: number
  color: string
}

// ── Revenue vs Expenses bar chart ─────────────────────────────────
export function RevenueExpensesChart({ months }: { months: MonthBar[] }) {
  const maxVal = Math.max(...months.flatMap(m => [m.revenue, m.expenses]), 1)
  const H = 140
  const barW = 16
  const gap = 4
  const groupW = barW * 2 + gap + 16
  const W = months.length * groupW

  return (
    <div>
      <div className="flex gap-4 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500 inline-block" />
          Příjmy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-400 inline-block" />
          Výdaje
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg width={W} height={H + 30} className="min-w-full">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={0} x2={W} y1={H - H * f} y2={H - H * f}
              stroke="#f1f5f9" strokeWidth={1} />
          ))}
          {months.map((m, i) => {
            const x = i * groupW + 8
            const rH = Math.max(Math.round((m.revenue / maxVal) * H), m.revenue > 0 ? 3 : 0)
            const eH = Math.max(Math.round((m.expenses / maxVal) * H), m.expenses > 0 ? 3 : 0)
            return (
              <g key={m.label}>
                <rect x={x} y={H - rH} width={barW} height={rH} rx={3} fill="#6366f1" opacity={0.9} />
                <rect x={x + barW + gap} y={H - eH} width={barW} height={eH} rx={3} fill="#fb7185" opacity={0.85} />
                <text x={x + barW + gap / 2} y={H + 18} textAnchor="middle"
                  style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'inherit' }}>
                  {m.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ── Donut chart for expense categories ───────────────────────────
export function CategoryDonut({ slices }: { slices: CategorySlice[] }) {
  const total = slices.reduce((s, x) => s + x.amount, 0)
  if (total === 0) return <p className="text-sm text-slate-400 py-6 text-center">Žádné výdaje</p>

  const R = 56
  const cx = 72
  const cy = 72
  let cursor = -Math.PI / 2

  const paths = slices.map(s => {
    const pct = s.amount / total
    const angle = pct * 2 * Math.PI
    const x1 = cx + R * Math.cos(cursor)
    const y1 = cy + R * Math.sin(cursor)
    cursor += angle
    const x2 = cx + R * Math.cos(cursor)
    const y2 = cy + R * Math.sin(cursor)
    const large = angle > Math.PI ? 1 : 0
    return { ...s, d: `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`, pct }
  })

  return (
    <div className="flex items-center gap-5">
      <svg width={144} height={144} className="shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.9} />
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={32} fill="white" />
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 11, fill: '#64748b', fontFamily: 'inherit' }}>Výdaje</text>
        <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'inherit' }}>celkem</text>
      </svg>
      <div className="space-y-1.5 text-xs">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-slate-600 flex-1">{s.label}</span>
            <span className="text-slate-800 font-semibold tabular-nums ml-2">
              {s.amount.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Profit line sparkline ─────────────────────────────────────────
export function ProfitSparkline({ months }: { months: MonthBar[] }) {
  const profits = months.map(m => m.revenue - m.expenses)
  const min = Math.min(...profits, 0)
  const max = Math.max(...profits, 1)
  const H = 60
  const W = 280
  const step = W / Math.max(months.length - 1, 1)

  const points = profits.map((p, i) => {
    const x = i * step
    const y = H - ((p - min) / (max - min)) * H
    return `${x},${y}`
  }).join(' ')

  const zeroY = H - ((0 - min) / (max - min)) * H

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2">Zisk / ztráta po měsících</p>
      <svg width={W} height={H + 4} className="w-full">
        {/* Zero line */}
        <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 2" />
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {profits.map((p, i) => (
          <circle key={i} cx={i * step} cy={H - ((p - min) / (max - min)) * H} r={3}
            fill={p >= 0 ? '#6366f1' : '#fb7185'} />
        ))}
      </svg>
    </div>
  )
}
