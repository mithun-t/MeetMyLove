import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  CalendarHeart,
  CheckCircle2,
  Clock,
  Heart,
  Milestone as MilestoneIcon,
  Sparkles,
  Trophy,
} from 'lucide-react'
import {
  addDays,
  addYears,
  differenceInCalendarDays,
  differenceInMonths,
  format,
  isBefore,
  parseISO,
} from 'date-fns'
import type { ComputedStats, TripRow } from '../../types/reunion.ts'

interface AnniversaryMilestone {
  yearNumber: number
  targetDate: Date
  dateStr: string
  title: string
  theme: string
  isPast: boolean
  isNext: boolean
  daysRemaining: number
}

interface DayMilestone {
  dayCount: number
  targetDate: Date
  dateStr: string
  title: string
  isPast: boolean
  isNext: boolean
  daysRemaining: number
}

const TRADITIONAL_THEMES: Record<number, string> = {
  1: 'Paper — The First Written Chapter',
  2: 'Cotton — Intertwined & Growing Stronger',
  3: 'Leather — Resilient Through Any Distance',
  4: 'Fruit & Flowers — Blossoming Memories',
  5: 'Wood — Deep-Rooted & Unshakable Love',
  6: 'Iron — Everlasting Strength & Devotion',
  7: 'Copper — Warmth and Enduring Harmony',
}

export function AnniversaryCard({
  stats,
  rows,
}: {
  stats: ComputedStats
  rows: TripRow[]
}) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const firstDate = useMemo(() => {
    return stats.firstDate ? parseISO(stats.firstDate) : new Date(2021, 9, 30)
  }, [stats.firstDate])

  // Total relationship duration
  const daysOfLove = useMemo(() => {
    return Math.max(0, differenceInCalendarDays(now, firstDate))
  }, [now, firstDate])

  const monthsOfLove = useMemo(() => {
    return Math.max(0, differenceInMonths(now, firstDate))
  }, [now, firstDate])

  // October / Anniversary Month reunion count
  const anniversaryMonthMeets = useMemo(() => {
    const firstMonthIndex = firstDate.getMonth() // 9 for October
    return rows.filter((row) => {
      const rowMonth = parseISO(row.startDate).getMonth()
      return rowMonth === firstMonthIndex
    }).length
  }, [rows, firstDate])

  // Yearly anniversaries list (from 1 to 6)
  const { yearlyMilestones, nextAnniversary } = useMemo(() => {
    const milestones: AnniversaryMilestone[] = []
    let next: AnniversaryMilestone | null = null

    for (let yr = 1; yr <= 6; yr++) {
      const targetDate = addYears(firstDate, yr)
      const isPast = isBefore(targetDate, now)
      const daysRemaining = differenceInCalendarDays(targetDate, now)
      const isNext = !isPast && (next === null || daysRemaining < next.daysRemaining)

      const milestone: AnniversaryMilestone = {
        yearNumber: yr,
        targetDate,
        dateStr: format(targetDate, 'MMM d, yyyy'),
        title: `${yr}${yr === 1 ? 'st' : yr === 2 ? 'nd' : yr === 3 ? 'rd' : 'th'} Anniversary`,
        theme: TRADITIONAL_THEMES[yr] ?? 'Golden Milestone',
        isPast,
        isNext: false,
        daysRemaining: Math.max(0, daysRemaining),
      }

      if (isNext) {
        next = milestone
      }
      milestones.push(milestone)
    }

    if (next) {
      next.isNext = true
    }

    return { yearlyMilestones: milestones, nextAnniversary: next }
  }, [firstDate, now])

  // Major Day Count Milestones (500, 1000, 1500, 2000 days)
  const dayMilestones = useMemo(() => {
    const targets = [500, 1000, 1500, 2000, 2500]
    let nextAssigned = false

    return targets.map((dayCount): DayMilestone => {
      const targetDate = addDays(firstDate, dayCount)
      const isPast = daysOfLove >= dayCount
      const daysRemaining = Math.max(0, differenceInCalendarDays(targetDate, now))
      const isNext = !isPast && !nextAssigned

      if (isNext) nextAssigned = true

      return {
        dayCount,
        targetDate,
        dateStr: format(targetDate, 'MMM d, yyyy'),
        title: `${dayCount.toLocaleString()} Days of Love`,
        isPast,
        isNext,
        daysRemaining,
      }
    })
  }, [firstDate, daysOfLove, now])

  return (
    <section className="w-full min-w-0 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 p-5 shadow-sm dark:border-rose-900/40 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm shadow-rose-200 dark:bg-rose-600 dark:shadow-none">
            <CalendarHeart size={22} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Anniversaries & Relationship Milestones
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                <Heart size={11} className="fill-rose-500 text-rose-500" />
                Since {format(firstDate, 'MMMM d, yyyy')}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">
              Tracking our recurring milestones and celebrating every milestone day together
            </p>
          </div>
        </div>
      </div>

      {/* Main Countdown Banner */}
      {nextAnniversary && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-rose-200 bg-white p-5 shadow-xs dark:border-rose-900/50 dark:bg-stone-800/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-rose-600 dark:text-rose-400">
                <Sparkles size={14} />
                Next Big Milestone
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
                {nextAnniversary.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {nextAnniversary.theme} • {nextAnniversary.dateStr}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-xl bg-rose-50 px-4 py-3 dark:bg-rose-950/50 sm:self-auto">
              <div className="text-center">
                <div className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                  {nextAnniversary.daysRemaining}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Days to Go
                </div>
              </div>
              <div className="h-8 w-px bg-rose-200 dark:bg-rose-800" />
              <div className="text-xs text-stone-600 dark:text-stone-300 leading-snug">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {format(nextAnniversary.targetDate, 'EEEE')}
                </span>
                <br />
                {format(nextAnniversary.targetDate, 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Item Quick Stats Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200/90 bg-white/90 p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900/90">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            <Heart size={13} className="text-rose-500" />
            Days of Love
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">
            {daysOfLove.toLocaleString()}
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            Consecutive days since first meet
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/90 bg-white/90 p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900/90">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            <Calendar size={13} className="text-pink-500" />
            Months Together
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">
            {monthsOfLove}
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            Monthly anniversaries shared
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/90 bg-white/90 p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900/90">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            <Trophy size={13} className="text-amber-500" />
            Anniversary Month Meets
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">
            {anniversaryMonthMeets}
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            Trips in {format(firstDate, 'MMMM')}
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/90 bg-white/90 p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900/90">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            <Clock size={13} className="text-indigo-500" />
            Journey Span
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">
            {(daysOfLove / 365.25).toFixed(1)} <span className="text-sm font-semibold">yrs</span>
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            Continuous chapters written
          </p>
        </div>
      </div>

      {/* Yearly Milestones Track */}
      <div className="mt-6">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          <MilestoneIcon size={14} className="text-rose-500" />
          Annual Milestone Journey
        </h3>

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {yearlyMilestones.map((milestone) => (
            <div
              key={milestone.yearNumber}
              className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                milestone.isNext
                  ? 'border-rose-400 bg-rose-50/70 shadow-xs ring-1 ring-rose-300 dark:border-rose-600 dark:bg-rose-950/40 dark:ring-rose-800'
                  : milestone.isPast
                    ? 'border-stone-200 bg-white/90 dark:border-stone-800 dark:bg-stone-900/70'
                    : 'border-stone-200/60 bg-stone-50/50 opacity-70 dark:border-stone-800/60 dark:bg-stone-900/30'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {milestone.isPast ? (
                  <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400" />
                ) : milestone.isNext ? (
                  <Sparkles size={18} className="text-rose-600 animate-pulse dark:text-rose-400" />
                ) : (
                  <Clock size={18} className="text-stone-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {milestone.title}
                  </span>
                  {milestone.isPast ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Celebrated ✓
                    </span>
                  ) : milestone.isNext ? (
                    <span className="rounded-md bg-rose-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      In {milestone.daysRemaining}d
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500">Upcoming</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-stone-600 dark:text-stone-400 truncate">
                  {milestone.theme}
                </div>
                <div className="mt-1 text-[11px] font-medium text-stone-500 dark:text-stone-500">
                  {milestone.dateStr}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Days Count Progression Bar */}
      <div className="mt-6 rounded-xl border border-stone-200/90 bg-white/80 p-4 dark:border-stone-800 dark:bg-stone-900/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Days of Love Milestones
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {dayMilestones.map((dm) => (
            <div
              key={dm.dayCount}
              className={`rounded-lg p-2.5 text-center border ${
                dm.isPast
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : dm.isNext
                    ? 'border-rose-300 bg-rose-50/80 ring-1 ring-rose-300 dark:border-rose-800 dark:bg-rose-950/40'
                    : 'border-stone-100 bg-stone-50/50 text-stone-500 dark:border-stone-800 dark:bg-stone-900/40'
              }`}
            >
              <div
                className={`text-xs font-bold ${
                  dm.isPast
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : dm.isNext
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-stone-500 dark:text-stone-500'
                }`}
              >
                {dm.dayCount.toLocaleString()} Days
              </div>
              <div className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                {dm.dateStr}
              </div>
              <div className="mt-1">
                {dm.isPast ? (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Achieved
                  </span>
                ) : dm.isNext ? (
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    In {dm.daysRemaining}d
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-500">Ahead</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
