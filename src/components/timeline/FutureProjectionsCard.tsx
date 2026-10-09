import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  ChevronRight,
  Clock,
  Hourglass,
  Sparkles,
  Target,
} from 'lucide-react'
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { ComputedStats, TripRow } from '../../types/reunion.ts'
import { formatMeetDate } from '../../lib/format.ts'

export function FutureProjectionsCard({
  stats,
  rows,
}: {
  stats: ComputedStats
  rows: TripRow[]
}) {
  const [now, setNow] = useState(() => new Date())

  // Keep countdown updated once a minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Find next upcoming meet if any date is in the future
  const nextMeet = useMemo(() => {
    const todayStr = format(now, 'yyyy-MM-dd')
    const futureTrip = rows.find((r) => r.startDate >= todayStr)
    if (!futureTrip) return null

    const daysUntil = differenceInCalendarDays(parseISO(futureTrip.startDate), now)
    return {
      trip: futureTrip,
      daysUntil: Math.max(0, daysUntil),
    }
  }, [rows, now])

  // Milestones projections
  const projections = useMemo(() => {
    const totalDays = stats.totalMeetDays

    // Next Century milestone (e.g. if 185, next is 200, then 250, 300)
    let nextTarget = 50
    while (nextTarget <= totalDays) {
      nextTarget += 50
    }
    const daysNeeded = nextTarget - totalDays

    // Average pace: days between meet days
    const ratePerDay = stats.spanDays > 0 ? totalDays / stats.spanDays : 0.05
    const daysToNextTarget = ratePerDay > 0 ? Math.round(daysNeeded / ratePerDay) : 100

    const latestDate = stats.latestDate ? parseISO(stats.latestDate) : now
    const estimatedDate = addDays(latestDate, daysToNextTarget)

    // Milestone after that
    const subsequentTarget = nextTarget + 50
    const subsequentDaysNeeded = subsequentTarget - totalDays
    const subsequentEstimatedDate = addDays(
      latestDate,
      ratePerDay > 0 ? Math.round(subsequentDaysNeeded / ratePerDay) : 250,
    )

    return {
      current: totalDays,
      nextTarget,
      daysNeeded,
      estimatedDate,
      progressPct: Math.min(100, Math.round(((totalDays % 50) / 50) * 100)),
      subsequentTarget,
      subsequentEstimatedDate,
      dailyRate: (ratePerDay * 30).toFixed(1),
    }
  }, [stats, now])

  return (
    <section className="w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <CalendarClock size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Future Projected Milestones & Countdown
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Next reunion countdown and automated pace forecasts for upcoming milestones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Meet Countdown Box */}
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/40 p-4.5 flex flex-col justify-between shadow-2xs dark:border-rose-950/60 dark:from-stone-800/80 dark:via-stone-850 dark:to-stone-900">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <Clock size={12} /> Next Reunion
              </span>
              {nextMeet && (
                <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
                  {nextMeet.trip.tripId}
                </span>
              )}
            </div>

            {nextMeet ? (
              <div className="space-y-1">
                <p className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                  {nextMeet.daysUntil === 0 ? (
                    <span className="text-rose-600 dark:text-rose-400">Reunion is Today! 🎉</span>
                  ) : (
                    <>
                      {nextMeet.daysUntil} <span className="text-base font-medium text-stone-500 dark:text-stone-400">days away</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                  {formatMeetDate(nextMeet.trip.startDate)}
                  {nextMeet.trip.startDate !== nextMeet.trip.endDate &&
                    ` – ${formatMeetDate(nextMeet.trip.endDate)}`}
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Duration: {nextMeet.trip.meetCount} meet {nextMeet.trip.meetCount === 1 ? 'day' : 'days'}
                </p>
              </div>
            ) : (
              <div className="py-2 space-y-1">
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-200 font-semibold text-base">
                  <Hourglass size={18} className="text-rose-500 shrink-0" />
                  <span>No Future Dates Scheduled Yet</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Click the <strong>"Add Meet"</strong> button at the top to log your next upcoming plan and start the live countdown!
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-rose-100/80 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Last recorded meet:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {stats.latestDate ? formatMeetDate(stats.latestDate) : '–'}
            </span>
          </div>
        </div>

        {/* Milestone Run-Rate Forecast Box */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4.5 flex flex-col justify-between dark:border-stone-800 dark:bg-stone-800/40">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-200/70 text-stone-700 dark:bg-stone-750 dark:text-stone-300">
                <Target size={12} /> Projected Century Milestone
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                {projections.daysNeeded} days to go
              </span>
            </div>

            {/* Target Header & Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {projections.nextTarget} Days Together
                </span>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {projections.current} / {projections.nextTarget}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-rose-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${projections.progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-0.5">
                <span>Estimated arrival:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  ~ {format(projections.estimatedDate, 'MMMM yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Subsequent Forecast Badge */}
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span className="inline-flex items-center gap-1 text-stone-500 dark:text-stone-400">
              <Sparkles size={13} className="text-amber-500" />
              Follow-up ({projections.subsequentTarget} days):
            </span>
            <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1">
              ~ {format(projections.subsequentEstimatedDate, 'MMM yyyy')}
              <ChevronRight size={13} className="text-stone-400" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
