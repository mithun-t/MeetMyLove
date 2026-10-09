import { useMemo } from 'react'
import {
  Award,
  Calendar,
  Flame,
  Heart,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { ComputedStats, TripRow } from '../../types/reunion.ts'
import { formatMeetDate, monthLabel } from '../../lib/format.ts'

export function SuperlativesCard({
  stats,
  rows,
}: {
  stats: ComputedStats
  rows: TripRow[]
}) {
  const records = useMemo(() => {
    // 1. Longest Single Trip
    const longestTrip = stats.longestTrip

    // 2. Shortest & Longest Gap between consecutive meets
    let shortestGap = { days: Infinity, from: '', to: '' }
    let longestGap = { days: 0, from: '', to: '' }

    for (const g of stats.gaps) {
      if (g.gapDays < shortestGap.days) {
        shortestGap = { days: g.gapDays, from: g.fromTripId, to: g.tripId }
      }
      if (g.gapDays > longestGap.days) {
        longestGap = { days: g.gapDays, from: g.fromTripId, to: g.tripId }
      }
    }

    // 3. Most Active Calendar Year
    const peakYear = stats.peakYear

    // 4. Busiest Month
    const busiest = stats.busiestMonth

    // 5. Longest Streak / Multi-Day Share
    const multiDayPct = stats.multiDayShare.toFixed(0)

    // 6. Latest Milestone or High Mark
    const totalDays = stats.totalMeetDays

    return [
      {
        icon: Award,
        color: 'text-amber-500 bg-amber-50 border-amber-200',
        title: 'Longest Single Trip',
        value: `${longestTrip.meetCount} Days`,
        desc: `${longestTrip.tripId} (${formatMeetDate(longestTrip.startDate)} – ${formatMeetDate(longestTrip.endDate)})`,
      },
      {
        icon: Zap,
        color: 'text-rose-500 bg-rose-50 border-rose-200',
        title: 'Shortest Waiting Gap',
        value: `${shortestGap.days === Infinity ? 0 : shortestGap.days} Days Apart`,
        desc: shortestGap.from ? `From ${shortestGap.from} to ${shortestGap.to}` : 'Only one meet recorded',
      },
      {
        icon: Flame,
        color: 'text-orange-500 bg-orange-50 border-orange-200',
        title: 'Peak Year Record',
        value: `${peakYear.meetDays} Meet Days`,
        desc: `Year ${peakYear.year} (${peakYear.tripCount} distinct trips)`,
      },
      {
        icon: Calendar,
        color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
        title: 'All-Time Busiest Month',
        value: `${busiest.count} Days Together`,
        desc: `${monthLabel(busiest.month)} ${busiest.year}`,
      },
      {
        icon: Sparkles,
        color: 'text-purple-500 bg-purple-50 border-purple-200',
        title: 'Multi-Day Meeting Share',
        value: `${multiDayPct}% of Trips`,
        desc: `${stats.multiDayTrips} of ${stats.totalTrips} trips spanned multiple days`,
      },
      {
        icon: Heart,
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        title: 'Grand Total Days Together',
        value: `${totalDays} Days`,
        desc: `Across ${stats.totalTrips} trips since ${rows[0]?.startDate ? formatMeetDate(rows[0].startDate) : '2021'}`,
      },
    ]
  }, [stats, rows])

  return (
    <section className="w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Award size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-stone-900">Trip Records & Superlatives</h2>
          <p className="text-xs text-stone-500">
            All-time milestones, records, and standout moments in our journey together.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {records.map((rec) => {
          const Icon = rec.icon
          return (
            <div
              key={rec.title}
              className="flex items-start gap-3.5 p-3.5 rounded-xl border border-stone-100 bg-stone-50/70 hover:bg-stone-50 transition-colors"
            >
              <span className={`p-2.5 rounded-xl border shrink-0 ${rec.color}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-stone-400">
                  {rec.title}
                </span>
                <span className="block text-base font-bold text-stone-900 leading-snug">
                  {rec.value}
                </span>
                <p className="mt-0.5 text-xs text-stone-500 truncate" title={rec.desc}>
                  {rec.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
