import { useMemo } from 'react'
import {
  Activity,
  CheckCircle,
  Flame,
  Milestone,
  Sparkles,
  Trophy,
} from 'lucide-react'
import type { HeatCell } from '../../types/reunion.ts'
import { MONTH_LABELS } from '../../lib/format.ts'

interface MonthStreakInfo {
  currentStreak: number
  longestStreak: number
  totalActiveMonths: number
  totalTrackedMonths: number
  consistencyScore: number
  yearlyBreakdown: {
    year: number
    months: {
      monthIndex: number
      count: number
      hasMeet: boolean
      isBeforeStart: boolean
    }[]
    activeCount: number
    totalDays: number
  }[]
}

export function StreakTrackerCard({
  cells,
  className = '',
}: {
  cells: HeatCell[]
  className?: string
}) {
  const streakInfo = useMemo((): MonthStreakInfo => {
    // Sort cells chronologically
    const sorted = [...cells].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    // First ever meeting is Oct 2021 (year 2021, month 9)
    const firstActiveIndex = sorted.findIndex((c) => c.count > 0)
    const relevantCells = firstActiveIndex >= 0 ? sorted.slice(firstActiveIndex) : sorted

    let longestStreak = 0
    let tempStreak = 0

    for (const cell of relevantCells) {
      if (cell.count > 0) {
        tempStreak += 1
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }
      } else {
        tempStreak = 0
      }
    }

    // Current streak (counting backwards from latest recorded active month)
    let currentStreak = 0
    for (let i = relevantCells.length - 1; i >= 0; i--) {
      const cell = relevantCells[i]
      if (cell.count > 0) {
        currentStreak += 1
      } else {
        // If the latest month is 0, check if we just haven't finished the month or if streak broke
        if (currentStreak > 0) break
      }
    }

    const totalActiveMonths = relevantCells.filter((c) => c.count > 0).length
    const totalTrackedMonths = relevantCells.length
    const consistencyScore =
      totalTrackedMonths > 0 ? Math.round((totalActiveMonths / totalTrackedMonths) * 100) : 100

    // Group by years
    const yearsMap = new Map<number, HeatCell[]>()
    for (const cell of sorted) {
      const arr = yearsMap.get(cell.year) ?? []
      arr.push(cell)
      yearsMap.set(cell.year, arr)
    }

    const yearsList = Array.from(yearsMap.keys()).sort((a, b) => a - b)
    const yearlyBreakdown = yearsList.map((year) => {
      const yearCells = yearsMap.get(year) ?? []
      const months = Array.from({ length: 12 }, (_, monthIdx) => {
        const found = yearCells.find((c) => c.month === monthIdx)
        const count = found?.count ?? 0
        const isBeforeStart = year === 2021 && monthIdx < 9
        return {
          monthIndex: monthIdx,
          count,
          hasMeet: count > 0,
          isBeforeStart,
        }
      })

      const activeCount = months.filter((m) => m.hasMeet).length
      const totalDays = months.reduce((sum, m) => sum + m.count, 0)

      return {
        year,
        months,
        activeCount,
        totalDays,
      }
    })

    return {
      currentStreak,
      longestStreak,
      totalActiveMonths,
      totalTrackedMonths,
      consistencyScore,
      yearlyBreakdown,
    }
  }, [cells])

  return (
    <section
      className={`w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
            <Flame size={20} className="fill-orange-500" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Monthly Reunion Streaks & Consistency
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Consecutive active months and month-by-month reunion cadence across 2021–2026.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          <Sparkles size={12} />
          {streakInfo.consistencyScore}% Consistency Score
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-orange-200/80 bg-orange-50/50 p-3.5 dark:border-orange-900/40 dark:bg-orange-950/20">
          <div className="flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-400">
            <Flame size={14} className="fill-orange-500" />
            Current Run
          </div>
          <div className="mt-1 text-2xl font-black text-orange-900 dark:text-orange-100">
            {streakInfo.currentStreak} <span className="text-sm font-semibold">months</span>
          </div>
          <p className="mt-0.5 text-[11px] text-orange-600/80 dark:text-orange-400/80">
            Consecutive meet months
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Trophy size={14} />
            Best Streak
          </div>
          <div className="mt-1 text-2xl font-black text-amber-900 dark:text-amber-100">
            {streakInfo.longestStreak} <span className="text-sm font-semibold">months</span>
          </div>
          <p className="mt-0.5 text-[11px] text-amber-600/80 dark:text-amber-400/80">
            All-time streak record
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
            <CheckCircle size={14} className="text-emerald-500" />
            Active Months
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">
            {streakInfo.totalActiveMonths} <span className="text-sm font-semibold">/ {streakInfo.totalTrackedMonths}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            Months reunited together
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
            <Activity size={14} className="text-rose-500" />
            Cadence Score
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">
            {streakInfo.consistencyScore}%
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            Journey coverage
          </p>
        </div>
      </div>

      {/* Month-by-Month Streak Matrix Grid */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-semibold uppercase text-stone-500 dark:text-stone-400">
              <th className="py-2 pr-3">Year</th>
              {MONTH_LABELS.map((m) => (
                <th key={m} className="px-1.5 py-2 text-center">
                  {m.slice(0, 3)}
                </th>
              ))}
              <th className="py-2 pl-3 text-right">Active</th>
              <th className="py-2 pl-2 text-right">Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/70">
            {streakInfo.yearlyBreakdown.map((row) => (
              <tr key={row.year} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                <td className="py-2.5 pr-3 font-bold text-stone-900 dark:text-stone-100">
                  {row.year}
                </td>
                {row.months.map((m) => {
                  if (m.isBeforeStart) {
                    return (
                      <td key={m.monthIndex} className="px-1.5 py-2 text-center">
                        <span className="inline-block h-4 w-4 rounded-full bg-stone-100 dark:bg-stone-800/40 text-stone-300 dark:text-stone-700 text-[10px] leading-4 select-none">
                          ·
                        </span>
                      </td>
                    )
                  }

                  if (m.hasMeet) {
                    return (
                      <td key={m.monthIndex} className="px-1.5 py-2 text-center">
                        <span
                          title={`${MONTH_LABELS[m.monthIndex]} ${row.year}: ${m.count} meet ${m.count === 1 ? 'day' : 'days'}`}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold transition-transform hover:scale-115 cursor-help ${
                            m.count >= 5
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : m.count >= 3
                                ? 'bg-rose-400 text-white dark:bg-rose-500'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {m.count}
                        </span>
                      </td>
                    )
                  }

                  return (
                    <td key={m.monthIndex} className="px-1.5 py-2 text-center">
                      <span
                        title={`${MONTH_LABELS[m.monthIndex]} ${row.year}: No meet recorded`}
                        className="inline-block h-2 w-2 rounded-full bg-stone-200 dark:bg-stone-750"
                      />
                    </td>
                  )
                })}
                <td className="py-2.5 pl-3 text-right font-semibold text-stone-700 dark:text-stone-300">
                  {row.activeCount}/12
                </td>
                <td className="py-2.5 pl-2 text-right font-bold text-rose-600 dark:text-rose-400">
                  {row.totalDays}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-rose-100 dark:bg-rose-950" />
            <span>1–2 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-rose-400 dark:bg-rose-500" />
            <span>3–4 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-rose-600" />
            <span>5+ days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-stone-200 dark:bg-stone-700" />
            <span>Apart</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-stone-400">
          <Milestone size={11} />
          <span>Hover a square to view month details</span>
        </div>
      </div>
    </section>
  )
}
