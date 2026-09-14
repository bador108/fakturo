'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout/legacy'
import {
  TrendingUp, TrendingDown, Receipt, AlertCircle, Wallet, GripVertical, Pencil, Check, X,
  Users, Calculator, Percent, AlertTriangle, Crown, Clock3, CalendarClock, PieChart, Coins,
  BarChart3, Target, StickyNote, Sparkles,
} from 'lucide-react'
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

interface Slice { label: string; amount: number; color: string }
interface ClientTotal { name: string; amount: number }
interface OverdueItem { id: string; clientName: string; invoiceNumber: string; total: number; currency: string; daysOverdue: number }
interface RecentItem { id: string; clientName: string; invoiceNumber: string; total: number; currency: string; status: string }
interface DueSoonItem { id: string; clientName: string; invoiceNumber: string; total: number; currency: string; dueDate: string }

interface Props {
  stats: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    totalVat: number
    totalPendingAndOverdue: number
    avgInvoiceValue: number
    marginPct: number
    clientCount: number
  }
  chartMonths: { label: string; revenue: number; expenses: number }[]
  catSlices: Slice[]
  statusSlices: Slice[]
  currencySlices: Slice[]
  weeklyRevenue: { label: string; revenue: number }[]
  topClients: ClientTotal[]
  overdueList: OverdueItem[]
  recentList: RecentItem[]
  dueSoonList: DueSoonItem[]
  monthRows: MonthRow[]
  invoiceCount: number
  initialLayout: DashboardLayout | null
}

interface DashboardLayout {
  layouts: ResponsiveLayouts
  colors: Record<string, string>
  widgets: string[]
  goal: number
  note: string
}

interface WidgetDef {
  id: string
  title: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  colorizable: boolean
  size: { w: number; h: number; minW: number; minH: number }
}

const WIDGET_CATALOG: WidgetDef[] = [
  { id: 'stat-revenue', title: 'Celkové příjmy', desc: 'Součet zaplacených faktur', icon: TrendingUp, colorizable: true, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'stat-expenses', title: 'Celkové výdaje', desc: 'Součet evidovaných výdajů', icon: TrendingDown, colorizable: true, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'stat-profit', title: 'Čistý zisk', desc: 'Příjmy minus výdaje', icon: Wallet, colorizable: false, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'stat-vat', title: 'DPH k odvodu', desc: 'DPH ze zaplacených faktur', icon: Receipt, colorizable: true, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'stat-pending', title: 'Čeká na platbu', desc: 'Odeslané a po splatnosti', icon: AlertCircle, colorizable: true, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'stat-clients', title: 'Počet klientů', desc: 'Kolik klientů máš v evidenci', icon: Users, colorizable: true, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'stat-avg-invoice', title: 'Průměrná faktura', desc: 'Průměrná hodnota faktury', icon: Calculator, colorizable: true, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'stat-margin', title: 'Zisková marže', desc: 'Marže v % z příjmů', icon: Percent, colorizable: true, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'chart-revenue', title: 'Příjmy vs. výdaje', desc: 'Sloupcový graf posledních měsíců', icon: BarChart3, colorizable: true, size: { w: 6, h: 8, minW: 4, minH: 5 } },
  { id: 'chart-category', title: 'Výdaje podle kategorií', desc: 'Donut graf kategorií výdajů', icon: PieChart, colorizable: false, size: { w: 6, h: 8, minW: 4, minH: 5 } },
  { id: 'chart-status', title: 'Stav faktur', desc: 'Rozložení podle stavu', icon: PieChart, colorizable: false, size: { w: 6, h: 8, minW: 4, minH: 5 } },
  { id: 'chart-currency', title: 'Rozložení měn', desc: 'Fakturováno v CZK/EUR/USD', icon: Coins, colorizable: false, size: { w: 6, h: 8, minW: 4, minH: 5 } },
  { id: 'chart-weekly', title: 'Týdenní příjmy', desc: 'Posledních 8 týdnů', icon: BarChart3, colorizable: true, size: { w: 6, h: 6, minW: 4, minH: 4 } },
  { id: 'list-overdue', title: 'Po splatnosti', desc: 'Faktury čekající na úhradu', icon: AlertTriangle, colorizable: false, size: { w: 4, h: 6, minW: 3, minH: 4 } },
  { id: 'list-top-clients', title: 'Top klienti', desc: '5 klientů s nejvyšším obratem', icon: Crown, colorizable: false, size: { w: 4, h: 6, minW: 3, minH: 4 } },
  { id: 'list-recent', title: 'Poslední faktury', desc: '5 nejnovějších faktur', icon: Clock3, colorizable: false, size: { w: 4, h: 6, minW: 3, minH: 4 } },
  { id: 'list-due-soon', title: 'Splatnost brzy', desc: 'Faktury splatné do 7 dní', icon: CalendarClock, colorizable: false, size: { w: 4, h: 6, minW: 3, minH: 4 } },
  { id: 'widget-goal', title: 'Měsíční cíl', desc: 'Nastav si cílový obrat', icon: Target, colorizable: true, size: { w: 4, h: 4, minW: 3, minH: 3 } },
  { id: 'widget-note', title: 'Poznámka', desc: 'Volná poznámka / to-do', icon: StickyNote, colorizable: false, size: { w: 4, h: 5, minW: 3, minH: 3 } },
  { id: 'widget-clock', title: 'Datum a čas', desc: 'Dekorativní widget', icon: Clock3, colorizable: false, size: { w: 2, h: 4, minW: 2, minH: 3 } },
  { id: 'widget-quote', title: 'Motivace', desc: 'Citát na dobré ráno', icon: Sparkles, colorizable: false, size: { w: 4, h: 4, minW: 3, minH: 3 } },
  { id: 'table-monthly', title: 'Měsíční přehled', desc: 'Tabulka fakturace po měsících', icon: BarChart3, colorizable: false, size: { w: 12, h: 7, minW: 6, minH: 4 } },
]

const CATALOG_MAP = new Map(WIDGET_CATALOG.map(w => [w.id, w]))

const DEFAULT_WIDGETS = ['stat-revenue', 'stat-expenses', 'stat-profit', 'stat-vat', 'stat-pending', 'chart-revenue', 'chart-category', 'table-monthly']

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
  'stat-clients': '#0ea5e9',
  'stat-avg-invoice': '#8b5cf6',
  'stat-margin': '#10b981',
  'chart-revenue': '#6366f1',
  'chart-weekly': '#4F46E5',
  'widget-goal': '#4F46E5',
}

const QUOTES = [
  'Malé kroky každý den vedou k velkým výsledkům.',
  'Faktura vystavená včas je faktura zaplacená včas.',
  'Nejlepší čas začít byl včera. Druhý nejlepší je teď.',
  'Kázeň v účetnictví = klid v hlavě.',
  'Klienti si pamatují, jak snadné bylo s tebou platit.',
]

function findNextY(layout: readonly LayoutItem[]): number {
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0)
}

export function FinanceDashboardGrid(props: Props) {
  const { stats, chartMonths, catSlices, statusSlices, currencySlices, weeklyRevenue, topClients, overdueList, recentList, dueSoonList, monthRows, invoiceCount, initialLayout } = props

  const [editing, setEditing] = useState(false)
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(initialLayout?.layouts ?? DEFAULT_LAYOUT)
  const [colors, setColors] = useState<Record<string, string>>({ ...DEFAULT_COLORS, ...initialLayout?.colors })
  const [activeWidgets, setActiveWidgets] = useState<string[]>(initialLayout?.widgets ?? DEFAULT_WIDGETS)
  const [goal, setGoal] = useState<number>(initialLayout?.goal ?? 100000)
  const [note, setNote] = useState<string>(initialLayout?.note ?? '')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persist = useCallback((next: Partial<DashboardLayout>) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    const payload = { layouts, colors, widgets: activeWidgets, goal, note, ...next }
    saveTimeout.current = setTimeout(() => {
      fetch('/api/dashboard-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }, 500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layouts, colors, activeWidgets, goal, note])

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }, [])

  function handleLayoutChange(_current: Layout, allLayouts: ResponsiveLayouts) {
    setLayouts(allLayouts)
    persist({ layouts: allLayouts })
  }

  function handleColorChange(widgetId: string, color: string) {
    const next = { ...colors, [widgetId]: color }
    setColors(next)
    persist({ colors: next })
  }

  function addWidget(id: string) {
    if (activeWidgets.includes(id)) return
    const def = CATALOG_MAP.get(id)
    if (!def) return
    const lgLayout = layouts.lg ?? []
    const y = findNextY(lgLayout)
    const newItem: LayoutItem = { i: id, x: 0, y, w: def.size.w, h: def.size.h, minW: def.size.minW, minH: def.size.minH }
    const nextLayouts = { ...layouts, lg: [...lgLayout, newItem] }
    const nextWidgets = [...activeWidgets, id]
    setLayouts(nextLayouts)
    setActiveWidgets(nextWidgets)
    persist({ layouts: nextLayouts, widgets: nextWidgets })
  }

  function removeWidget(id: string) {
    const nextWidgets = activeWidgets.filter(w => w !== id)
    const nextLayouts: ResponsiveLayouts = {}
    for (const bp of Object.keys(layouts)) {
      nextLayouts[bp] = (layouts[bp] ?? []).filter(item => item.i !== id)
    }
    setLayouts(nextLayouts)
    setActiveWidgets(nextWidgets)
    persist({ layouts: nextLayouts, widgets: nextWidgets })
  }

  function handleGoalChange(value: number) {
    setGoal(value)
    persist({ goal: value })
  }

  function handleNoteChange(value: string) {
    setNote(value)
    persist({ note: value })
  }

  function resetLayout() {
    setLayouts(DEFAULT_LAYOUT)
    setColors(DEFAULT_COLORS)
    setActiveWidgets(DEFAULT_WIDGETS)
    persist({ layouts: DEFAULT_LAYOUT, colors: DEFAULT_COLORS, widgets: DEFAULT_WIDGETS })
  }

  const availableToAdd = useMemo(() => WIDGET_CATALOG.filter(w => !activeWidgets.includes(w.id)), [activeWidgets])
  const colorizableActive = useMemo(() => WIDGET_CATALOG.filter(w => w.colorizable && activeWidgets.includes(w.id)), [activeWidgets])

  return (
    <div>
      {/* Softer, animated drop placeholder instead of a stark grid box */}
      <style>{`
        .react-grid-item.react-grid-placeholder {
          background: rgba(79, 70, 229, 0.12) !important;
          border: 1.5px dashed rgba(79, 70, 229, 0.4);
          border-radius: 16px;
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
        }
        .react-grid-item {
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), width 200ms, height 200ms;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 20;
        }
      `}</style>

      <div className="flex justify-end mb-3">
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

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0">
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
            {activeWidgets.map(id => (
              <div key={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <WidgetHeader
                  id={id}
                  editing={editing}
                  onRemove={() => removeWidget(id)}
                />
                <div className="flex-1 overflow-auto px-4 pb-4">
                  <WidgetBody
                    id={id}
                    stats={stats}
                    chartMonths={chartMonths}
                    catSlices={catSlices}
                    statusSlices={statusSlices}
                    currencySlices={currencySlices}
                    weeklyRevenue={weeklyRevenue}
                    topClients={topClients}
                    overdueList={overdueList}
                    recentList={recentList}
                    dueSoonList={dueSoonList}
                    monthRows={monthRows}
                    invoiceCount={invoiceCount}
                    color={colors[id]}
                    goal={goal}
                    onGoalChange={handleGoalChange}
                    note={note}
                    onNoteChange={handleNoteChange}
                  />
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>

        {editing && (
          <div className="w-72 shrink-0 space-y-4 sticky top-4">
            {colorizableActive.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Barvy</h3>
                <div className="space-y-2.5">
                  {colorizableActive.map(w => (
                    <div key={w.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 truncate">{w.title}</span>
                      <label
                        className="relative h-6 w-6 rounded-full border border-slate-200 shrink-0 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: colors[w.id] }}
                      >
                        <input
                          type="color"
                          value={colors[w.id] ?? '#6366f1'}
                          onChange={e => handleColorChange(w.id, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Přidat widget</h3>
                <button onClick={resetLayout} className="text-[11px] text-slate-400 hover:text-slate-600">Výchozí</button>
              </div>
              {availableToAdd.length === 0 ? (
                <p className="text-xs text-slate-400">Všechny widgety jsou už na nástěnce.</p>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {availableToAdd.map(w => {
                    const Icon = w.icon
                    return (
                      <button
                        key={w.id}
                        onClick={() => addWidget(w.id)}
                        className="w-full flex items-start gap-2.5 text-left p-2.5 rounded-xl border border-slate-100 hover:border-brand-soft hover:bg-brand-soft/40 transition"
                      >
                        <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800">{w.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{w.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WidgetHeader({ id, editing, onRemove }: { id: string; editing: boolean; onRemove: () => void }) {
  const def = CATALOG_MAP.get(id)
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {editing && <GripVertical className="widget-drag-handle h-4 w-4 text-slate-300 cursor-move shrink-0" />}
        <h3 className="font-semibold text-slate-800 text-sm truncate">{def?.title ?? id}</h3>
      </div>
      {editing && (
        <button onClick={onRemove} className="text-slate-300 hover:text-red-500 transition shrink-0" title="Odebrat widget">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

function StatBody({ value, icon, tint }: { value: string; icon: React.ReactNode; tint?: string }) {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: tint ? `${tint}1A` : '#f1f5f9' }}>
        {icon}
      </div>
      <p className="text-lg font-bold text-slate-900 tabular-nums truncate">{value}</p>
    </div>
  )
}

function WeeklyBarChart({ data, color = '#4F46E5' }: { data: { label: string; revenue: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  const H = 100
  const barW = 20
  const gap = 12
  const W = data.length * (barW + gap)
  return (
    <svg width={W} height={H + 24} className="max-w-full">
      {data.map((d, i) => {
        const h = Math.max(Math.round((d.revenue / max) * H), d.revenue > 0 ? 3 : 0)
        const x = i * (barW + gap)
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={barW} height={h} rx={4} fill={color} opacity={0.85} />
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" style={{ fontSize: 9, fill: '#94a3b8' }}>{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function ListRow({ primary, secondary, right, rightSub }: { primary: string; secondary?: string; right: string; rightSub?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{primary}</p>
        {secondary && <p className="text-[11px] text-slate-400 truncate">{secondary}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-slate-800 tabular-nums">{right}</p>
        {rightSub && <p className="text-[11px] text-slate-400">{rightSub}</p>}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-xs text-slate-400 py-6 text-center">{text}</p>
}

interface WidgetBodyProps {
  id: string
  stats: Props['stats']
  chartMonths: Props['chartMonths']
  catSlices: Slice[]
  statusSlices: Slice[]
  currencySlices: Slice[]
  weeklyRevenue: { label: string; revenue: number }[]
  topClients: ClientTotal[]
  overdueList: OverdueItem[]
  recentList: RecentItem[]
  dueSoonList: DueSoonItem[]
  monthRows: MonthRow[]
  invoiceCount: number
  color?: string
  goal: number
  onGoalChange: (v: number) => void
  note: string
  onNoteChange: (v: string) => void
}

function WidgetBody(p: WidgetBodyProps) {
  const { id, stats, chartMonths, catSlices, statusSlices, currencySlices, weeklyRevenue, topClients, overdueList, recentList, dueSoonList, monthRows, invoiceCount, color, goal, onGoalChange, note, onNoteChange } = p

  switch (id) {
    case 'stat-revenue':
      return <StatBody value={formatCurrency(stats.totalRevenue, 'CZK')} tint={color} icon={<TrendingUp className="h-4 w-4" style={{ color }} />} />
    case 'stat-expenses':
      return <StatBody value={formatCurrency(stats.totalExpenses, 'CZK')} tint={color} icon={<TrendingDown className="h-4 w-4" style={{ color }} />} />
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
        </div>
      )
    }
    case 'stat-vat':
      return <StatBody value={formatCurrency(stats.totalVat, 'CZK')} tint={color} icon={<Receipt className="h-4 w-4" style={{ color }} />} />
    case 'stat-pending':
      return <StatBody value={formatCurrency(stats.totalPendingAndOverdue, 'CZK')} tint={color} icon={<AlertCircle className="h-4 w-4" style={{ color }} />} />
    case 'stat-clients':
      return <StatBody value={String(stats.clientCount)} tint={color} icon={<Users className="h-4 w-4" style={{ color }} />} />
    case 'stat-avg-invoice':
      return <StatBody value={formatCurrency(stats.avgInvoiceValue, 'CZK')} tint={color} icon={<Calculator className="h-4 w-4" style={{ color }} />} />
    case 'stat-margin':
      return <StatBody value={`${stats.marginPct.toFixed(1)} %`} tint={color} icon={<Percent className="h-4 w-4" style={{ color }} />} />

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
      return catSlices.length === 0 ? <EmptyState text="Žádné výdaje" /> : <CategoryDonut slices={catSlices} />
    case 'chart-status':
      return statusSlices.length === 0 ? <EmptyState text="Žádné faktury" /> : <CategoryDonut slices={statusSlices} />
    case 'chart-currency':
      return currencySlices.length === 0 ? <EmptyState text="Žádné faktury" /> : <CategoryDonut slices={currencySlices} />
    case 'chart-weekly':
      return <WeeklyBarChart data={weeklyRevenue} color={color} />

    case 'list-overdue':
      return overdueList.length === 0 ? <EmptyState text="Nic po splatnosti 🎉" /> : (
        <div>{overdueList.map(i => (
          <ListRow key={i.id} primary={i.clientName} secondary={`#${i.invoiceNumber}`} right={formatCurrency(i.total, i.currency)} rightSub={`${i.daysOverdue} dní`} />
        ))}</div>
      )
    case 'list-top-clients':
      return topClients.length === 0 ? <EmptyState text="Zatím žádná data" /> : (
        <div>{topClients.map((c, i) => (
          <ListRow key={c.name} primary={`${i + 1}. ${c.name}`} right={formatCurrency(c.amount, 'CZK')} />
        ))}</div>
      )
    case 'list-recent':
      return recentList.length === 0 ? <EmptyState text="Zatím žádné faktury" /> : (
        <div>{recentList.map(i => (
          <ListRow key={i.id} primary={i.clientName} secondary={`#${i.invoiceNumber}`} right={formatCurrency(i.total, i.currency)}
            rightSub={i.status === 'paid' ? 'Zaplaceno' : i.status === 'sent' ? 'Odesláno' : i.status === 'draft' ? 'Koncept' : 'Storno'} />
        ))}</div>
      )
    case 'list-due-soon':
      return dueSoonList.length === 0 ? <EmptyState text="Nic splatného tento týden" /> : (
        <div>{dueSoonList.map(i => (
          <ListRow key={i.id} primary={i.clientName} secondary={`#${i.invoiceNumber}`} right={formatCurrency(i.total, i.currency)} rightSub={i.dueDate} />
        ))}</div>
      )

    case 'widget-goal': {
      const pct = goal > 0 ? Math.min(100, Math.round((stats.totalRevenue / goal) * 100)) : 0
      return (
        <div className="h-full flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{formatCurrency(stats.totalRevenue, 'CZK')}</span>
            <span className="text-slate-400">cíl {formatCurrency(goal, 'CZK')}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color ?? '#4F46E5' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">{pct}%</span>
            <input
              type="number"
              defaultValue={goal}
              onBlur={e => onGoalChange(Number(e.target.value) || 0)}
              className="w-24 text-xs text-right rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-soft"
            />
          </div>
        </div>
      )
    }
    case 'widget-note':
      return (
        <textarea
          defaultValue={note}
          onBlur={e => onNoteChange(e.target.value)}
          placeholder="Napiš si poznámku…"
          className="w-full h-full min-h-[80px] resize-none rounded-lg border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
        />
      )
    case 'widget-clock':
      return <ClockWidget />
    case 'widget-quote': {
      const quote = QUOTES[new Date().getDate() % QUOTES.length]
      return (
        <div className="h-full flex items-center">
          <p className="text-sm text-slate-600 italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>
      )
    }

    case 'table-monthly':
      return monthRows.length === 0 ? (
        <EmptyState text="Žádná data" />
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

function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(t)
  }, [])
  if (!now) return null
  return (
    <div className="h-full flex flex-col justify-center">
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</p>
      <p className="text-xs text-slate-400 mt-0.5 capitalize">{now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    </div>
  )
}

