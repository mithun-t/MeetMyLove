import { useMemo, useState } from 'react'
import { CalendarDays, Heart, Info } from 'lucide-react'
import {
  addDays,
  format,
  getDay,
  getDaysInYear,
  startOfYear,
} from 'date-fns'
import type { TripRow } from '../../types/reunion.ts'

interface DayCell {
  dateStr: string
  date: Date
  dayOfWeek: number // 0 = Sun, 6 = Sat
  weekIndex: number
  isMeetDay: boolean
  trip?: TripRow
  isInFuture: boolean
  isBeforeGenesis: boolean
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function FullCalendarHeatmap({
  rows,
  years,
  className = '',
}: {
  rows: TripRow[]
  years: number[]
  className?: string
}) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026)
  const [hoveredDay, setHoveredDay] = useState<DayCell | null>(null)
  const [now] = useState(() => new Date())

  // Map each ISO date to its trip
  const dateToTripMap = useMemo(() => {
    const map = new Map<string, TripRow>()
    for (const row of rows) {
      for (const d of row.meetDates) {
        map.set(d, row)
      }
    }
    return map
  }, [rows])

  // Active year data
  const displayedYears = useMemo(() => {
    const todayStr = format(now, 'yyyy-MM-dd')
    const genesisStr = '2021-10-30'

    const buildYear = (year: number) => {
      const startDate = startOfYear(new Date(year, 0, 1))
      const totalDays = getDaysInYear(startDate)

      const days: DayCell[] = []
      let currentWeek = 0
      const startDayOfWeek = getDay(startDate)

      for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
        const date = addDays(startDate, dayOffset)
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayOfWeek = getDay(date)
        const weekIndex = Math.floor((dayOffset + startDayOfWeek) / 7)

        const trip = dateToTripMap.get(dateStr)
        const isMeetDay = Boolean(trip)
        const isInFuture = dateStr > todayStr
        const isBeforeGenesis = dateStr < genesisStr

        days.push({
          dateStr,
          date,
          dayOfWeek,
          weekIndex,
          isMeetDay,
          trip,
          isInFuture,
          isBeforeGenesis,
        })

        if (weekIndex > currentWeek) {
          currentWeek = weekIndex
        }
      }

      const meetDaysCount = days.filter((d) => d.isMeetDay).length

      return {
        year,
        days,
        totalWeeks: currentWeek + 1,
        meetDaysCount,
        totalDays,
      }
    }

    if (selectedYear === 'all') {
      return [...years].sort((a, b) => b - a).map(buildYear)
    }
    return [buildYear(selectedYear)]
  }, [selectedYear, years, dateToTripMap, now])

  // Aggregate stats for the current view
  const currentViewStats = useMemo(() => {
    let totalTogether = 0
    let totalEligible = 0

    for (const y of displayedYears) {
      totalTogether += y.meetDaysCount
      totalEligible += y.totalDays
    }

    const pct = totalEligible > 0 ? ((totalTogether / totalEligible) * 100).toFixed(1) : '0'

    return { totalTogether, totalEligible, pct }
  }, [displayedYears])

  return (
    <section
      className={`w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <CalendarDays size={20} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Journey Day-by-Day Calendar
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Contribution-style activity grid of every day together across our entire story.
            </p>
          </div>
        </div>

        {/* Year Pills Filter */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-750'
            }`}
          >
            All Years
          </button>
          {[...years]
            .sort((a, b) => b - a)
            .map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-750'
                }`}
              >
                {yr}
              </button>
            ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-y border-stone-100 py-2.5 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-400">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
            <Heart size={13} className="fill-rose-500 text-rose-500" />
            {currentViewStats.totalTogether} days together
          </span>
          <span>out of {currentViewStats.totalEligible} days</span>
          <span>({currentViewStats.pct}% of time)</span>
        </div>

        {/* Hovered Tooltip Preview */}
        {hoveredDay ? (
          <div className="flex items-center gap-2 font-medium text-stone-800 dark:text-stone-200 animate-fadeIn">
            <span className="font-semibold">{format(hoveredDay.date, 'EEEE, MMM d, yyyy')}</span>
            <span>•</span>
            {hoveredDay.isMeetDay && hoveredDay.trip ? (
              <span className="font-bold text-rose-600 dark:text-rose-400">
                Together in {hoveredDay.trip.tripId} ({hoveredDay.trip.durationLabel})
              </span>
            ) : hoveredDay.isInFuture ? (
              <span className="text-stone-400">Upcoming future date</span>
            ) : hoveredDay.isBeforeGenesis ? (
              <span className="text-stone-400">Before our first meet</span>
            ) : (
              <span className="text-stone-500">Apart (countdown to reunion)</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-stone-400 italic">
            <Info size={12} /> Hover any day square to see reunion details
          </div>
        )}
      </div>

      {/* Heatmap Grids */}
      <div className="mt-4 space-y-6">
        {displayedYears.map((y) => (
          <div key={y.year} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {y.year} Overview
              </span>
              <span className="text-stone-500 dark:text-stone-400">
                <strong className="text-rose-600 dark:text-rose-400">{y.meetDaysCount}</strong> days together
              </span>
            </div>

            {/* Scrollable Container for GitHub Style Grid */}
            <div className="overflow-x-auto pb-1">
              <div className="inline-block min-w-full">
                {/* Month Headers */}
                <div className="flex text-[10px] text-stone-400 dark:text-stone-500 pb-1 pl-7">
                  {MONTH_SHORT.map((m) => (
                    <div key={m} className="w-[4.4%] text-left shrink-0">
                      {m}
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 items-start">
                  {/* Day of Week Labels */}
                  <div className="flex flex-col gap-[3px] text-[9px] text-stone-400 dark:text-stone-500 shrink-0 select-none pr-1">
                    <span className="h-3 leading-3">Sun</span>
                    <span className="h-3 leading-3 opacity-0">Mon</span>
                    <span className="h-3 leading-3">Tue</span>
                    <span className="h-3 leading-3 opacity-0">Wed</span>
                    <span className="h-3 leading-3">Thu</span>
                    <span className="h-3 leading-3 opacity-0">Fri</span>
                    <span className="h-3 leading-3">Sat</span>
                  </div>

                  {/* Weeks Columns */}
                  <div
                    className="grid grid-flow-col gap-[3px]"
                    style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
                  >
                    {y.days.map((day) => {
                      const isHovered = hoveredDay?.dateStr === day.dateStr
                      let cellClass = 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/60 dark:hover:bg-stone-750'

                      if (day.isBeforeGenesis) {
                        cellClass = 'bg-stone-50/50 dark:bg-stone-900/40 opacity-40'
                      } else if (day.isMeetDay) {
                        cellClass =
                          'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 ring-1 ring-rose-400/50 shadow-xs'
                      }

                      return (
                        <div
                          key={day.dateStr}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`h-3 w-3 rounded-[2.5px] transition-all cursor-pointer ${cellClass} ${
                            isHovered ? 'scale-130 z-10 ring-2 ring-rose-500 shadow-sm' : ''
                          }`}
                          style={{
                            gridRowStart: day.dayOfWeek + 1,
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-xs bg-stone-100 dark:bg-stone-800" title="Apart" />
            <span className="h-3 w-3 rounded-xs bg-rose-300 dark:bg-rose-800" />
            <span className="h-3 w-3 rounded-xs bg-rose-500 dark:bg-rose-600" title="Together" />
          </div>
          <span>More</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
            <span>Meet Day</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-xs bg-stone-100 dark:bg-stone-800" />
            <span>Apart Day</span>
          </div>
        </div>
      </div>
    </section>
  )
}
