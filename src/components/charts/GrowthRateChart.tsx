import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'
import type { HeatCell } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { MONTH_LABELS } from '../../lib/format.ts'

interface GrowthPoint {
  key: string
  year: number
  monthIndex: number
  label: string
  currentDays: number
  prevDays: number
  diffDays: number
  pctChange: number
}

export function GrowthRateChart({
  cells,
  years,
  className = '',
}: {
  cells: HeatCell[]
  years: number[]
  className?: string
}) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [metric, setMetric] = useState<'diff' | 'pct'>('diff')

  // Build month-over-month chronological data
  const fullData = useMemo((): GrowthPoint[] => {
    const sorted = [...cells].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    // Start from first meet in Oct 2021 (month 9)
    const firstMeetIndex = sorted.findIndex((c) => c.count > 0)
    const activeTimeline = firstMeetIndex >= 0 ? sorted.slice(firstMeetIndex) : sorted

    const points: GrowthPoint[] = []

    for (let i = 1; i < activeTimeline.length; i++) {
      const prev = activeTimeline[i - 1]
      const curr = activeTimeline[i]

      const diffDays = curr.count - prev.count
      let pctChange = 0

      if (prev.count > 0) {
        pctChange = Math.round(((curr.count - prev.count) / prev.count) * 100)
      } else if (curr.count > 0) {
        pctChange = 100
      }

      points.push({
        key: `${curr.year}-${curr.month}`,
        year: curr.year,
        monthIndex: curr.month,
        label: `${MONTH_LABELS[curr.month].slice(0, 3)} '${String(curr.year).slice(2)}`,
        currentDays: curr.count,
        prevDays: prev.count,
        diffDays,
        pctChange,
      })
    }

    return points
  }, [cells])

  const filteredData = useMemo(() => {
    if (selectedYear === 'all') return fullData
    return fullData.filter((p) => p.year === selectedYear)
  }, [fullData, selectedYear])

  const stats = useMemo(() => {
    const positiveCount = filteredData.filter((p) => p.diffDays > 0).length
    const negativeCount = filteredData.filter((p) => p.diffDays < 0).length
    const neutralCount = filteredData.filter((p) => p.diffDays === 0).length
    const maxSurge = filteredData.reduce(
      (max, p) => (p.diffDays > max.diffDays ? p : max),
      filteredData[0] ?? { diffDays: 0, label: '—' },
    )

    return { positiveCount, negativeCount, neutralCount, maxSurge }
  }, [filteredData])

  return (
    <ChartCard
      title="Month-over-Month Reunion Velocity"
      subtitle="Rate of change in reunion days compared to the previous month"
      className={className}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Toggle */}
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800">
            <button
              type="button"
              onClick={() => setMetric('diff')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                metric === 'diff'
                  ? 'bg-white text-stone-900 shadow-2xs dark:bg-stone-700 dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              ± Days
            </button>
            <button
              type="button"
              onClick={() => setMetric('pct')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                metric === 'pct'
                  ? 'bg-white text-stone-900 shadow-2xs dark:bg-stone-700 dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              % Growth
            </button>
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => {
              const val = e.target.value
              setSelectedYear(val === 'all' ? 'all' : Number(val))
            }}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {/* Metric Mini-Strip */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-2.5 dark:border-stone-800 dark:bg-stone-850/50">
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight size={13} /> Positive Surges
          </div>
          <div className="mt-0.5 text-lg font-bold text-stone-900 dark:text-stone-100">
            {stats.positiveCount} <span className="text-xs font-normal text-stone-500">months</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-2.5 dark:border-stone-800 dark:bg-stone-850/50">
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <ArrowDownRight size={13} /> Downturns
          </div>
          <div className="mt-0.5 text-lg font-bold text-stone-900 dark:text-stone-100">
            {stats.negativeCount} <span className="text-xs font-normal text-stone-500">months</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-2.5 dark:border-stone-800 dark:bg-stone-850/50">
          <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Steady Pace
          </div>
          <div className="mt-0.5 text-lg font-bold text-stone-900 dark:text-stone-100">
            {stats.neutralCount} <span className="text-xs font-normal text-stone-500">months</span>
          </div>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <TrendingUp size={13} /> Peak Surge
          </div>
          <div className="mt-0.5 text-lg font-bold text-rose-700 dark:text-rose-300">
            +{stats.maxSurge.diffDays}d <span className="text-xs font-normal text-stone-500">({stats.maxSurge.label})</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#888888' }}
              interval={selectedYear === 'all' ? 3 : 0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#888888' }}
              tickFormatter={(v) => (metric === 'diff' ? `${v}d` : `${v}%`)}
            />
            <ReferenceLine y={0} stroke="#88888850" strokeWidth={1.5} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as GrowthPoint
                const isPositive = item.diffDays > 0
                const isNegative = item.diffDays < 0

                return (
                  <div className="rounded-xl border border-stone-200 bg-white/95 p-3 text-xs shadow-md backdrop-blur-xs dark:border-stone-700 dark:bg-stone-900/95">
                    <p className="font-bold text-stone-900 dark:text-stone-100">{item.label}</p>
                    <div className="mt-1.5 space-y-1 text-stone-600 dark:text-stone-300">
                      <div className="flex items-center justify-between gap-4">
                        <span>Current month:</span>
                        <strong className="text-stone-900 dark:text-stone-100">{item.currentDays} days</strong>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Previous month:</span>
                        <span>{item.prevDays} days</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-1 dark:border-stone-800">
                        <span>Net Difference:</span>
                        <strong
                          className={
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isNegative
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-stone-500'
                          }
                        >
                          {isPositive ? `+${item.diffDays}` : item.diffDays} days ({item.pctChange > 0 ? `+${item.pctChange}` : item.pctChange}%)
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey={metric === 'diff' ? 'diffDays' : 'pctChange'} radius={[3, 3, 3, 3]}>
              {filteredData.map((entry) => {
                const val = metric === 'diff' ? entry.diffDays : entry.pctChange
                const fillColor =
                  val > 0 ? '#10b981' : val < 0 ? '#f59e0b' : '#a8a29e'
                return <Cell key={entry.key} fill={fillColor} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
