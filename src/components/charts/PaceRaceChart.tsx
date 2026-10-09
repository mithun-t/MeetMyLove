import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getDayOfYear, parseISO } from 'date-fns'
import type { TripRow } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor } from './chartTheme.ts'

const YEAR_COLORS: Record<number, string> = {
  2021: '#a8a29e', // stone-400
  2022: '#f59e0b', // amber-500
  2023: '#06b6d4', // cyan-500
  2024: '#8b5cf6', // purple-500
  2025: '#3b82f6', // blue-500
  2026: '#e11d48', // rose-600
}

function getColorForYear(year: number, index: number): string {
  if (YEAR_COLORS[year]) return YEAR_COLORS[year]
  const fallbacks = ['#10b981', '#ec4899', '#6366f1', '#14b8a6']
  return fallbacks[index % fallbacks.length]
}

export function PaceRaceChart({
  rows,
  years,
  className,
}: {
  rows: TripRow[]
  years: number[]
  className?: string
}) {
  const [selectedYears, setSelectedYears] = useState<number[]>(years)

  const toggleYear = (y: number) => {
    if (selectedYears.includes(y)) {
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter((item) => item !== y))
      }
    } else {
      setSelectedYears([...selectedYears, y].sort((a, b) => a - b))
    }
  }

  // Pre-calculate cumulative progress for each day of year (sample intervals every 10 days up to 365)
  const chartData = useMemo(() => {
    const daysInterval = [1, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 365]

    // Pre-group trips by year
    const tripsByYear = new Map<number, { dayOfYear: number; meetCount: number }[]>()
    for (const y of years) {
      tripsByYear.set(y, [])
    }

    for (const r of rows) {
      if (r.startDate) {
        const doy = getDayOfYear(parseISO(r.startDate))
        tripsByYear.get(r.year)?.push({ dayOfYear: doy, meetCount: r.meetCount })
      }
    }

    return daysInterval.map((doy) => {
      const monthApprox = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
        'Year End',
      ][Math.min(12, Math.floor((doy - 1) / 30))]

      const point: Record<string, string | number> = {
        doy,
        label: `${monthApprox} (Day ${doy})`,
      }

      for (const y of years) {
        const yearTrips = tripsByYear.get(y) ?? []
        const totalUptoDoy = yearTrips
          .filter((t) => t.dayOfYear <= doy)
          .reduce((sum, t) => sum + t.meetCount, 0)
        point[String(y)] = totalUptoDoy
      }

      return point
    })
  }, [rows, years])

  return (
    <ChartCard
      className={className}
      title="Cumulative Pace Race"
      subtitle="Track cumulative meet days accumulated throughout the year (Steepest slope = Fastest pace)."
      action={
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedYears(years)}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            All Years
          </button>
          <button
            type="button"
            onClick={() => setSelectedYears(years.slice(-3))}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            Last 3 Years
          </button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-stone-400 mr-1">Toggle race:</span>
        {years.map((y, idx) => {
          const isActive = selectedYears.includes(y)
          const color = getColorForYear(y, idx)
          return (
            <button
              key={y}
              type="button"
              onClick={() => toggleYear(y)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-700'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isActive ? color : '#a8a29e' }}
              />
              {y}
            </button>
          )
        })}
      </div>

      <div className="h-72 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={20} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(val, name) => [`${val ?? 0} meet days`, `Year ${name}`]}
            />
            <Legend />
            {years.map((y, idx) => {
              if (!selectedYears.includes(y)) return null
              const color = getColorForYear(y, idx)
              const isLatest = y === Math.max(...years)
              return (
                <Line
                  key={y}
                  type="monotone"
                  dataKey={String(y)}
                  name={String(y)}
                  stroke={color}
                  strokeWidth={isLatest ? 3 : 2}
                  dot={{ r: isLatest ? 4 : 2, fill: color }}
                  activeDot={{ r: 6 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
