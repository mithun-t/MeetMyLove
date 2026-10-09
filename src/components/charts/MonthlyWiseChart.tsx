import { useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMonth, parseISO } from 'date-fns'
import type { MonthlyPoint, TripRow, YearFilter } from '../../types/reunion.ts'
import { MONTH_LABELS } from '../../lib/format.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor, meetColor, tripColor } from './chartTheme.ts'

export function MonthlyWiseChart({
  rows,
  years,
  className,
}: {
  rows: TripRow[]
  years: number[]
  className?: string
}) {
  const [selectedYear, setSelectedYear] = useState<YearFilter>('all')

  const chartData: MonthlyPoint[] = useMemo(() => {
    const monthlyTotals: MonthlyPoint[] = MONTH_LABELS.map((month, idx) => ({
      month,
      monthIndex: idx,
      meetDays: 0,
      tripCount: 0,
    }))

    const relevantRows =
      selectedYear === 'all' ? rows : rows.filter((r) => r.year === selectedYear)

    for (const row of relevantRows) {
      if (row.startDate) {
        const m = getMonth(parseISO(row.startDate))
        monthlyTotals[m].tripCount += 1
      }
      for (const iso of row.meetDates) {
        const m = getMonth(parseISO(iso))
        monthlyTotals[m].meetDays += 1
      }
    }

    return monthlyTotals
  }, [rows, selectedYear])

  return (
    <ChartCard
      className={className}
      title="Monthly meet distribution"
      subtitle={
        selectedYear === 'all'
          ? 'Cumulative meet days and trip counts across all months (All Years).'
          : `Meet days and trip counts for ${selectedYear} across all months.`
      }
      action={
        <div className="flex items-center gap-2">
          <label htmlFor="monthly-year-filter" className="text-xs font-medium text-stone-500">
            Filter:
          </label>
          <select
            id="monthly-year-filter"
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
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis yAxisId="days" tickLine={false} axisLine={false} fontSize={12} width={32} />
            <YAxis
              yAxisId="trips"
              orientation="right"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={28}
            />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend />
            <Bar
              yAxisId="days"
              dataKey="meetDays"
              name="Meet days"
              fill={meetColor}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Line
              yAxisId="trips"
              type="monotone"
              dataKey="tripCount"
              name="Trips"
              stroke={tripColor}
              strokeWidth={2.5}
              dot={{ r: 4, fill: tripColor }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

