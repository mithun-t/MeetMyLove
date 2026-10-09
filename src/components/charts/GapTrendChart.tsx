import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { GapPoint, YearFilter } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor } from './chartTheme.ts'

export function GapTrendChart({
  data,
  years,
  className,
}: {
  data: GapPoint[]
  years: number[]
  className?: string
}) {
  const [selectedYear, setSelectedYear] = useState<YearFilter>('all')

  const filteredData = useMemo(() => {
    if (selectedYear === 'all') return data
    return data.filter((d) => d.year === selectedYear)
  }, [data, selectedYear])

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avg: 0, min: 0, max: 0 }
    const values = filteredData.map((d) => d.gapDays)
    const sum = values.reduce((acc, v) => acc + v, 0)
    return {
      avg: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }, [filteredData])

  return (
    <ChartCard
      className={className}
      title="Days apart trend"
      subtitle={
        selectedYear === 'all'
          ? `Waiting time between consecutive meets (Avg: ${stats.avg} days apart). Lower is closer!`
          : `Waiting time between meets in ${selectedYear} (Avg: ${stats.avg} days apart).`
      }
      action={
        <div className="flex items-center gap-2">
          <label htmlFor="gap-year-filter" className="text-xs font-medium text-stone-500">
            Filter:
          </label>
          <select
            id="gap-year-filter"
            value={selectedYear === 'all' ? 'all' : String(selectedYear)}
            onChange={(e) => {
              const val = e.target.value
              setSelectedYear(val === 'all' ? 'all' : Number(val))
            }}
            className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-200 cursor-pointer"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="h-72 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={24} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={36}
              unit="d"
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value) => [`${value ?? 0} days apart`, 'Wait duration']}
              labelFormatter={(_label, payload) => {
                const item = payload?.[0]?.payload as GapPoint | undefined
                if (!item) return ''
                return `${item.fromTripId} ➔ ${item.tripId} (${item.date})`
              }}
            />
            {stats.avg > 0 && (
              <ReferenceLine
                y={stats.avg}
                stroke="#fda4af"
                strokeDasharray="3 3"
                label={{
                  value: `Avg: ${stats.avg}d`,
                  fill: '#e11d48',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="gapDays"
              name="Days apart"
              stroke="#e11d48"
              strokeWidth={2}
              fill="url(#gapGradient)"
              dot={{ r: 3, fill: '#e11d48' }}
              activeDot={{ r: 5, fill: '#be123c' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
        <span>⚡ Shortest wait: <strong className="text-stone-700">{stats.min} days</strong></span>
        <span>⏱️ Average wait: <strong className="text-stone-700">{stats.avg} days</strong></span>
        <span>⏳ Longest wait: <strong className="text-stone-700">{stats.max} days</strong></span>
      </div>
    </ChartCard>
  )
}
