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

export function ValueBubble({ x, y, text }: { x: number; y: number; text: string }) {
  const w = text.length * 5.6 + 14
  return (
    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      <rect x={x - w / 2} y={y - 20} width={w} height={18} rx={5} fill="#0c0c0e" />
      <text x={x} y={y - 7} textAnchor="middle" style={{ fontSize: 9, fill: '#fff', fontWeight: 600, fontFamily: 'inherit' }}>{text}</text>
    </g>
  )
}

// ── Revenue vs Expenses bar chart ─────────────────────────────────
export function RevenueExpensesChart({ months, color = '#6366f1' }: { months: MonthBar[]; color?: string }) {
  const maxVal = Math.max(...months.flatMap(m => [m.revenue, m.expenses]), 1)
  const H = 140
  const TOP_PAD = 26
  const barW = 16
  const gap = 4
  const groupW = barW * 2 + gap + 16
  const W = months.length * groupW

  return (
    <div>
      <div className="flex gap-4 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: color }} />
          Příjmy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-400 inline-block" />
          Výdaje
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg width={W} height={H + 30 + TOP_PAD} className="min-w-full">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={0} x2={W} y1={TOP_PAD + H - H * f} y2={TOP_PAD + H - H * f}
              stroke="#f1f5f9" strokeWidth={1} />
          ))}
          {months.map((m, i) => {
            const x = i * groupW + 8
            const rH = Math.max(Math.round((m.revenue / maxVal) * H), m.revenue > 0 ? 3 : 0)
            const eH = Math.max(Math.round((m.expenses / maxVal) * H), m.expenses > 0 ? 3 : 0)
            const revLabel = `${m.revenue.toLocaleString('cs-CZ')} Kč`
            const expLabel = `${m.expenses.toLocaleString('cs-CZ')} Kč`
            return (
              <g key={m.label}>
                <g className="group cursor-default">
                  <rect x={x} y={TOP_PAD + H - rH} width={barW} height={rH} rx={3} fill={color} opacity={0.9} />
                  <ValueBubble x={x + barW / 2} y={TOP_PAD + H - rH} text={revLabel} />
                </g>
                <g className="group cursor-default">
                  <rect x={x + barW + gap} y={TOP_PAD + H - eH} width={barW} height={eH} rx={3} fill="#fb7185" opacity={0.85} />
                  <ValueBubble x={x + barW + gap + barW / 2} y={TOP_PAD + H - eH} text={expLabel} />
                </g>
                <text x={x + barW + gap / 2} y={TOP_PAD + H + 18} textAnchor="middle"
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

  const R = 76
  const cx = 96
  const cy = 96
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
      <svg width={192} height={192} className="shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.9}>
            <title>{`${p.label}: ${p.amount.toLocaleString('cs-CZ')} Kč (${Math.round(p.pct * 100)} %)`}</title>
          </path>
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={44} fill="white" />
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
