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
import type { HeatCell } from '../../types/reunion.ts'
import { MONTH_LABELS } from '../../lib/format.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor } from './chartTheme.ts'

// Harmonious palette tailored for years
const YEAR_COLORS: Record<number, string> = {
  2021: '#a8a29e', // stone-400
  2022: '#f59e0b', // amber-500
  2023: '#06b6d4', // cyan-500
  2024: '#8b5cf6', // purple-500
  2025: '#3b82f6', // blue-500
  2026: '#e11d48', // rose-600 (current/highlight)
}

function getColorForYear(year: number, index: number): string {
  if (YEAR_COLORS[year]) return YEAR_COLORS[year]
  const fallbacks = ['#10b981', '#ec4899', '#6366f1', '#14b8a6', '#f97316']
  return fallbacks[index % fallbacks.length]
}

export function YearOverYearChart({
  cells,
  className,
}: {
  cells: HeatCell[]
  className?: string
}) {
  const allYears = useMemo(
    () => [...new Set(cells.map((cell) => cell.year))].sort((a, b) => a - b),
    [cells],
  )

  // Allow toggling visible year lines
  const [selectedYears, setSelectedYears] = useState<number[]>(allYears)

  const toggleYear = (y: number) => {
    if (selectedYears.includes(y)) {
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter((item) => item !== y))
      }
    } else {
      setSelectedYears([...selectedYears, y].sort((a, b) => a - b))
    }
  }

  const selectAll = () => setSelectedYears(allYears)
  const selectRecent = () => setSelectedYears(allYears.slice(-3))

  // Data structure for Recharts:
  // Array of 12 items (Jan–Dec), each having { month: 'Jan', '2021': 0, '2022': 2, ... }
  const chartData = useMemo(() => {
    return MONTH_LABELS.map((monthName, monthIndex) => {
      const row: Record<string, string | number> = {
        month: monthName,
        monthIndex,
      }

      for (const y of allYears) {
        const cell = cells.find((c) => c.year === y && c.month === monthIndex)
        row[String(y)] = cell ? cell.count : 0
      }

      return row
    })
  }, [cells, allYears])

  return (
    <ChartCard
      className={className}
      title="Year-over-Year comparison"
      subtitle="Compare monthly meet frequency across 2021–2026 side-by-side."
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            All
          </button>
          <button
            type="button"
            onClick={selectRecent}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Last 3 Years
          </button>
        </div>
      }
    >
      {/* Year toggle tags */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-stone-400 mr-1">Toggle years:</span>
        {allYears.map((y, idx) => {
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
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} unit="d" />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(val, name) => [`${val ?? 0} meet days`, `Year ${name}`]}
            />
            <Legend />
            {allYears.map((y, idx) => {
              if (!selectedYears.includes(y)) return null
              const color = getColorForYear(y, idx)
              const isLatest = y === Math.max(...allYears)
              return (
                <Line
                  key={y}
                  type="monotone"
                  dataKey={String(y)}
                  name={String(y)}
                  stroke={color}
                  strokeWidth={isLatest ? 3 : 2}
                  dot={{ r: isLatest ? 4 : 3, fill: color }}
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
