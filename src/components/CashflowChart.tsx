'use client'

interface MonthData {
  label: string
  revenue: number
  invoiced: number
}

interface CashflowChartProps {
  months: MonthData[]
}

export function CashflowChart({ months }: CashflowChartProps) {
  const maxVal = Math.max(...months.map(m => Math.max(m.revenue, m.invoiced)), 1)
  const chartHeight = 120
  const barWidth = 18
  const gap = 12
  const groupWidth = barWidth * 2 + gap
  const svgWidth = months.length * (groupWidth + 16)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" />
          Zaplaceno
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-200" />
          Fakturováno
        </span>
      </div>
      <svg width={svgWidth} height={chartHeight + 28} className="min-w-full">
        {months.map((m, i) => {
          const x = i * (groupWidth + 16) + 8
          const revenueH = Math.round((m.revenue / maxVal) * chartHeight)
          const invoicedH = Math.round((m.invoiced / maxVal) * chartHeight)

          return (
            <g key={m.label}>
              {/* Paid bar */}
              <rect
                x={x}
                y={chartHeight - revenueH}
                width={barWidth}
                height={revenueH || 2}
                rx={3}
                fill="#6366f1"
                opacity={0.9}
              />
              {/* Invoiced bar */}
              <rect
                x={x + barWidth + 4}
                y={chartHeight - invoicedH}
                width={barWidth}
                height={invoicedH || 2}
                rx={3}
                fill="#c7d2fe"
              />
              {/* Month label */}
              <text
                x={x + barWidth}
                y={chartHeight + 16}
                textAnchor="middle"
                className="fill-slate-400"
                style={{ fontSize: 10, fontFamily: 'inherit' }}
              >
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function buildMonthData(invoices: { status: string; total: number; issue_date: string }[]): MonthData[] {
  const now = new Date()
  const months: MonthData[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('cs-CZ', { month: 'short' })

    const monthInvoices = invoices.filter(inv => inv.issue_date?.startsWith(key))
    const revenue = monthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
    const invoiced = monthInvoices.reduce((s, i) => s + Number(i.total), 0)

    months.push({ label, revenue, invoiced })
  }

  return months
}
