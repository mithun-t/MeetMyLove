import {
  CalendarHeart,
  CalendarRange,
  Gauge,
  Hourglass,
  Layers,
  Route,
  Trophy,
  TrendingUp,
} from 'lucide-react'
import type { ComputedStats } from '../../types/reunion.ts'
import { formatCount, formatDays, formatMeetDate, formatPercent } from '../../lib/format.ts'
import { KpiCard } from './KpiCard.tsx'

export function KpiGrid({ stats }: { stats: ComputedStats }) {
  return (
    <section aria-label="Summary" className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total days met"
        value={formatCount(stats.totalMeetDays)}
        hint="Meet days across every recorded trip"
        icon={CalendarHeart}
      />
      <KpiCard
        label="Total trips"
        value={formatCount(stats.totalTrips)}
        hint="Distinct trip records from 2021 to 2026"
        icon={Route}
      />
      <KpiCard
        label="Multi-day trips"
        value={formatCount(stats.multiDayTrips)}
        hint={`${formatPercent(stats.multiDayShare)} of all trips`}
        icon={Layers}
      />
      <KpiCard
        label="Longest trip"
        value={formatDays(stats.longestTrip.meetCount)}
        hint={stats.longestTrip.tripId}
        icon={Trophy}
      />
      <KpiCard
        label="Average days per trip"
        value={formatCount(stats.averageMeetsPerTrip, 1)}
        hint="Meet days divided by trip count"
        icon={Gauge}
      />
      <KpiCard
        label="Peak year"
        value={String(stats.peakYear.year)}
        hint={`${formatDays(stats.peakYear.meetDays)} together`}
        icon={TrendingUp}
      />
      <KpiCard
        label="Average gap"
        value={formatDays(Math.round(stats.averageGapDays))}
        hint="Between consecutive trip start dates"
        icon={Hourglass}
      />
      <KpiCard
        label="Span"
        value={formatDays(stats.spanDays)}
        hint={`${formatMeetDate(stats.firstDate)} to ${formatMeetDate(stats.latestDate)}`}
        icon={CalendarRange}
      />
    </section>
  )
}
