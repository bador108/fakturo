'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import type { Layout, ResponsiveLayouts } from 'react-grid-layout/legacy'
import { TrendingUp, TrendingDown, Receipt, AlertCircle, Wallet, GripVertical, Pencil, Check, Palette } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { RevenueExpensesChart, CategoryDonut, ProfitSparkline } from '@/components/FinanceCharts'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface MonthRow {
  month: string
  label: string
  subtotal: number
  vatAmount: number
  total: number
  paidTotal: number
  invoiceCount: number
}

interface Props {
  stats: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    totalVat: number
    totalPendingAndOverdue: number
  }
  chartMonths: { label: string; revenue: number; expenses: number }[]
  catSlices: { label: string; amount: number; color: string }[]
  monthRows: MonthRow[]
  invoiceCount: number
  initialLayout: DashboardLayout | null
}

interface DashboardLayout {
  layouts: ResponsiveLayouts
  colors: Record<string, string>
}

const WIDGET_IDS = ['stat-revenue', 'stat-expenses', 'stat-profit', 'stat-vat', 'stat-pending', 'chart-revenue', 'chart-category', 'table-monthly'] as const

const DEFAULT_LAYOUT: ResponsiveLayouts = {
  lg: [
    { i: 'stat-revenue', x: 0, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'stat-expenses', x: 2, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'stat-profit', x: 4, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'stat-vat', x: 6, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'stat-pending', x: 8, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'chart-revenue', x: 0, y: 4, w: 6, h: 8, minW: 4, minH: 5 },
    { i: 'chart-category', x: 6, y: 4, w: 6, h: 8, minW: 4, minH: 5 },
    { i: 'table-monthly', x: 0, y: 12, w: 12, h: 7, minW: 6, minH: 4 },
  ],
}

const DEFAULT_COLORS: Record<string, string> = {
  'stat-revenue': '#4F46E5',
  'stat-expenses': '#f43f5e',
  'stat-vat': '#d97706',
  'stat-pending': '#ef4444',
  'chart-revenue': '#6366f1',
}

function widgetTitle(id: string): string {
  return {
    'stat-revenue': 'Celkové příjmy',
    'stat-expenses': 'Celkové výdaje',
    'stat-profit': 'Čistý zisk',
    'stat-vat': 'DPH k odvodu',
    'stat-pending': 'Čeká na platbu',
    'chart-revenue': 'Příjmy vs. výdaje',
    'chart-category': 'Výdaje podle kategorií',
    'table-monthly': 'Měsíční přehled',
  }[id] ?? id
}

const COLORIZABLE = new Set(['stat-revenue', 'stat-expenses', 'stat-vat', 'stat-pending', 'chart-revenue'])

export function FinanceDashboardGrid({ stats, chartMonths, catSlices, monthRows, invoiceCount, initialLayout }: Props) {
  const [editing, setEditing] = useState(false)
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(initialLayout?.layouts ?? DEFAULT_LAYOUT)
  const [colors, setColors] = useState<Record<string, string>>({ ...DEFAULT_COLORS, ...initialLayout?.colors })
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persist = useCallback((nextLayouts: ResponsiveLayouts, nextColors: Record<string, string>) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      fetch('/api/dashboard-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layouts: nextLayouts, colors: nextColors }),
      }).catch(() => {})
    }, 500)
  }, [])

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }, [])

  function handleLayoutChange(_current: Layout, allLayouts: ResponsiveLayouts) {
    setLayouts(allLayouts)
    persist(allLayouts, colors)
  }

  function handleColorChange(widgetId: string, color: string) {
    const next = { ...colors, [widgetId]: color }
    setColors(next)
    persist(layouts, next)
  }

  function resetLayout() {
    setLayouts(DEFAULT_LAYOUT)
    setColors(DEFAULT_COLORS)
    persist(DEFAULT_LAYOUT, DEFAULT_COLORS)
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-3">
        {editing && (
          <button
            onClick={resetLayout}
            className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5"
          >
            Výchozí rozložení
          </button>
        )}
        <button
          onClick={() => setEditing(e => !e)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            editing ? 'bg-brand text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editing ? 'Hotovo' : 'Upravit rozložení'}
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 480 }}
        cols={{ lg: 12, md: 8, sm: 4 }}
        rowHeight={32}
        margin={[16, 16]}
        isDraggable={editing}
        isResizable={editing}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
      >
        {WIDGET_IDS.map(id => (
          <div key={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <WidgetHeader id={id} editing={editing} color={colors[id]} onColorChange={c => handleColorChange(id, c)} />
            <div className="flex-1 overflow-auto px-4 pb-4">
              <WidgetBody
                id={id}
                stats={stats}
                chartMonths={chartMonths}
                catSlices={catSlices}
                monthRows={monthRows}
                invoiceCount={invoiceCount}
                color={colors[id]}
              />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
}

function WidgetHeader({ id, editing, color, onColorChange }: { id: string; editing: boolean; color?: string; onColorChange: (c: string) => void }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {editing && <GripVertical className="widget-drag-handle h-4 w-4 text-slate-300 cursor-move shrink-0" />}
        <h3 className="font-semibold text-slate-800 text-sm truncate">{widgetTitle(id)}</h3>
      </div>
      {COLORIZABLE.has(id) && (
        <label
          className="relative h-6 w-6 rounded-full border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: color }}
          title="Barva widgetu"
        >
          <Palette className="h-3 w-3 text-white/70 mix-blend-difference pointer-events-none" />
          <input
            type="color"
            value={color}
            onChange={e => onColorChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      )}
    </div>
  )
}

function StatBody({ value, label, icon, tint }: { value: string; label: string; icon: React.ReactNode; tint?: string }) {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: tint ? `${tint}1A` : undefined }}>
        {icon}
      </div>
      <p className="text-lg font-bold text-slate-900 tabular-nums truncate">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function WidgetBody({ id, stats, chartMonths, catSlices, monthRows, invoiceCount, color }: {
  id: string
  stats: Props['stats']
  chartMonths: Props['chartMonths']
  catSlices: Props['catSlices']
  monthRows: Props['monthRows']
  invoiceCount: number
  color?: string
}) {
  switch (id) {
    case 'stat-revenue':
      return <StatBody value={formatCurrency(stats.totalRevenue, 'CZK')} label="Celkové příjmy" tint={color} icon={<TrendingUp className="h-4 w-4" style={{ color }} />} />
    case 'stat-expenses':
      return <StatBody value={formatCurrency(stats.totalExpenses, 'CZK')} label="Celkové výdaje" tint={color} icon={<TrendingDown className="h-4 w-4" style={{ color }} />} />
    case 'stat-profit': {
      const positive = stats.netProfit >= 0
      return (
        <div className="h-full flex flex-col justify-center">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-2 ${positive ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <Wallet className={`h-4 w-4 ${positive ? 'text-emerald-600' : 'text-red-500'}`} />
          </div>
          <p className={`text-lg font-bold tabular-nums truncate ${positive ? 'text-emerald-700' : 'text-red-600'}`}>
            {positive ? '+' : ''}{formatCurrency(stats.netProfit, 'CZK')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Čistý zisk</p>
        </div>
      )
    }
    case 'stat-vat':
      return <StatBody value={formatCurrency(stats.totalVat, 'CZK')} label="DPH k odvodu" tint={color} icon={<Receipt className="h-4 w-4" style={{ color }} />} />
    case 'stat-pending':
      return <StatBody value={formatCurrency(stats.totalPendingAndOverdue, 'CZK')} label="Čeká na platbu" tint={color} icon={<AlertCircle className="h-4 w-4" style={{ color }} />} />
    case 'chart-revenue':
      return (
        <div>
          <RevenueExpensesChart months={chartMonths} color={color} />
          <div className="mt-4 pt-4 border-t border-slate-50">
            <ProfitSparkline months={chartMonths} color={color} />
          </div>
        </div>
      )
    case 'chart-category':
      return (
        <div>
          <CategoryDonut slices={catSlices} />
          {catSlices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Celkem výdajů</span>
              <span className="font-semibold text-slate-800">{formatCurrency(stats.totalExpenses, 'CZK')}</span>
            </div>
          )}
        </div>
      )
    case 'table-monthly':
      return monthRows.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">Žádná data</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="py-2 text-left text-xs font-medium text-slate-400">Měsíc</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">Faktur</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">Základ DPH</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">DPH</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">Fakturováno</th>
                <th className="py-2 text-right text-xs font-medium text-slate-400">Zaplaceno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthRows.map(row => (
                <tr key={row.month} className="hover:bg-slate-50/50">
                  <td className="py-3 font-medium text-slate-800 capitalize">{row.label}</td>
                  <td className="px-3 py-3 text-right text-slate-500">{row.invoiceCount}</td>
                  <td className="px-3 py-3 text-right text-slate-600 tabular-nums">{formatCurrency(row.subtotal, 'CZK')}</td>
                  <td className="px-3 py-3 text-right text-amber-600 tabular-nums">{formatCurrency(row.vatAmount, 'CZK')}</td>
                  <td className="px-3 py-3 text-right text-slate-700 font-medium tabular-nums">{formatCurrency(row.total, 'CZK')}</td>
                  <td className="py-3 text-right text-emerald-600 font-semibold tabular-nums">{formatCurrency(row.paidTotal, 'CZK')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-100 bg-slate-50/50">
              <tr>
                <td className="py-3 font-semibold text-slate-700">Celkem</td>
                <td className="px-3 py-3 text-right text-slate-600">{invoiceCount}</td>
                <td className="px-3 py-3 text-right font-semibold text-slate-700 tabular-nums">
                  {formatCurrency(monthRows.reduce((s, r) => s + r.subtotal, 0), 'CZK')}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-amber-700 tabular-nums">
                  {formatCurrency(monthRows.reduce((s, r) => s + r.vatAmount, 0), 'CZK')}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-700 tabular-nums">
                  {formatCurrency(monthRows.reduce((s, r) => s + r.total, 0), 'CZK')}
                </td>
                <td className="py-3 text-right font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(stats.totalRevenue, 'CZK')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )
    default:
      return null
  }
}
