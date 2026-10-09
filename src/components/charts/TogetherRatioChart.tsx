import { useMemo, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { TripRow, YearFilter } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle } from './chartTheme.ts'

interface RatioData {
  name: string
  value: number
  color: string
}

export function TogetherRatioChart({
  rows,
  years,
  className,
}: {
  rows: TripRow[]
  years: number[]
  className?: string
}) {
  const [selectedYear, setSelectedYear] = useState<YearFilter>('all')

  const { data, percentage, totalDays, togetherDays, apartDays } = useMemo(() => {
    let span = 0
    let together = 0

    if (selectedYear === 'all') {
      if (rows.length === 0) return { data: [], percentage: 0, totalDays: 0, togetherDays: 0, apartDays: 0 }
      const firstDate = rows[0]?.startDate ?? ''
      const latestDate = rows[rows.length - 1]?.endDate ?? ''
      span = differenceInCalendarDays(parseISO(latestDate), parseISO(firstDate)) + 1
      together = rows.reduce((acc, r) => acc + r.meetCount, 0)
    } else {
      const yearRows = rows.filter((r) => r.year === selectedYear)
      const isLeap = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0
      span = isLeap ? 366 : 365
      together = yearRows.reduce((acc, r) => acc + r.meetCount, 0)
    }

    const apart = Math.max(0, span - together)
    const pct = span > 0 ? ((together / span) * 100).toFixed(1) : '0'

    const pieData: RatioData[] = [
      { name: 'Days Together', value: together, color: '#e11d48' }, // Rose-600
      { name: 'Days Apart', value: apart, color: '#e7e5e4' }, // Stone-200
    ]

    return {
      data: pieData,
      percentage: pct,
      totalDays: span,
      togetherDays: together,
      apartDays: apart,
    }
  }, [rows, selectedYear])

  return (
    <ChartCard
      className={className}
      title="Days Together vs. Apart"
      subtitle={
        selectedYear === 'all'
          ? `Overall time ratio across the relationship span (${percentage}% spent together).`
          : `Calendar days breakdown in ${selectedYear} (${percentage}% spent together).`
      }
      action={
        <div className="flex items-center gap-2">
          <label htmlFor="ratio-year-filter" className="text-xs font-medium text-stone-500">
            Filter:
          </label>
          <select
            id="ratio-year-filter"
            value={selectedYear === 'all' ? 'all' : String(selectedYear)}
            onChange={(e) => {
              const val = e.target.value
              setSelectedYear(val === 'all' ? 'all' : Number(val))
            }}
            className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-200 cursor-pointer"
          >
            <option value="all">Total Span</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="relative h-72 overflow-hidden flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value, name) => [`${value ?? 0} days`, `${name}`]}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={72}
              outerRadius={100}
              paddingAngle={3}
              stroke="transparent"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Percentage Display */}
        <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="block text-2xl font-bold tracking-tight text-rose-600">
            {percentage}%
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Together
          </span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-center text-xs">
        <div className="rounded-xl bg-rose-50 p-2 text-rose-900">
          <span className="block text-[11px] text-rose-600 font-medium">Together</span>
          <strong className="text-sm font-semibold">{togetherDays} days</strong>
        </div>
        <div className="rounded-xl bg-stone-100 p-2 text-stone-700">
          <span className="block text-[11px] text-stone-500 font-medium">Apart</span>
          <strong className="text-sm font-semibold">{apartDays} days</strong>
        </div>
        <div className="rounded-xl bg-stone-50 p-2 text-stone-700">
          <span className="block text-[11px] text-stone-500 font-medium">Total Span</span>
          <strong className="text-sm font-semibold">{totalDays} days</strong>
        </div>
      </div>
    </ChartCard>
  )
}
