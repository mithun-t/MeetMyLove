import { useMemo, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getDay, parseISO } from 'date-fns'
import type { TripRow, YearFilter } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle } from './chartTheme.ts'

interface DayRatioPoint {
  name: string
  value: number
  color: string
}

export function WeekendRatioChart({
  rows,
  years,
  className,
}: {
  rows: TripRow[]
  years: number[]
  className?: string
}) {
  const [selectedYear, setSelectedYear] = useState<YearFilter>('all')

  const { data, weekendCount, weekdayCount, weekendPct, weekdayPct } = useMemo(() => {
    let weekend = 0
    let weekday = 0

    const targetRows = selectedYear === 'all' ? rows : rows.filter((r) => r.year === selectedYear)

    for (const r of targetRows) {
      for (const iso of r.meetDates) {
        const dayOfWeek = getDay(parseISO(iso)) // 0 = Sun, 6 = Sat
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekend += 1
        } else {
          weekday += 1
        }
      }
    }

    const total = weekend + weekday
    const wkndPct = total > 0 ? ((weekend / total) * 100).toFixed(1) : '0'
    const wkdyPct = total > 0 ? ((weekday / total) * 100).toFixed(1) : '0'

    const pieData: DayRatioPoint[] = [
      { name: 'Weekend (Sat & Sun)', value: weekend, color: '#f43f5e' }, // Rose-500
      { name: 'Weekday (Mon–Fri)', value: weekday, color: '#0ea5e9' }, // Sky-500
    ]

    return {
      data: pieData,
      weekendCount: weekend,
      weekdayCount: weekday,
      weekendPct: wkndPct,
      weekdayPct: wkdyPct,
    }
  }, [rows, selectedYear])

  return (
    <ChartCard
      className={className}
      title="Weekend vs. Weekday Affinity"
      subtitle={
        selectedYear === 'all'
          ? `Overall breakdown: ${weekendPct}% on weekends vs ${weekdayPct}% on weekdays.`
          : `Breakdown in ${selectedYear}: ${weekendPct}% on weekends vs ${weekdayPct}% on weekdays.`
      }
      action={
        <div className="flex items-center gap-2">
          <label htmlFor="weekend-year-filter" className="text-xs font-medium text-stone-500">
            Filter:
          </label>
          <select
            id="weekend-year-filter"
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
      <div className="relative h-72 overflow-hidden flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value, name) => [`${value ?? 0} meet days`, `${name}`]}
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

        <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="block text-2xl font-bold tracking-tight text-rose-600">
            {weekendPct}%
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Weekend
          </span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-center text-xs">
        <div className="rounded-xl bg-rose-50 p-2 text-rose-900">
          <span className="block text-[11px] text-rose-600 font-medium">Weekend Days</span>
          <strong className="text-sm font-semibold">{weekendCount} days ({weekendPct}%)</strong>
        </div>
        <div className="rounded-xl bg-sky-50 p-2 text-sky-900">
          <span className="block text-[11px] text-sky-600 font-medium">Weekday Days</span>
          <strong className="text-sm font-semibold">{weekdayCount} days ({weekdayPct}%)</strong>
        </div>
      </div>
    </ChartCard>
  )
}
