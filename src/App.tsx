import { useMemo, useState } from 'react'
import { meetYears } from './data/meets.ts'
import { computeStats, filterTrips, flattenTrips } from './lib/stats.ts'
import type { YearFilter } from './types/reunion.ts'
import { DashboardShell } from './components/layout/DashboardShell.tsx'
import { KpiGrid } from './components/kpi/KpiGrid.tsx'
import { AnnualChart } from './components/charts/AnnualChart.tsx'
import { MonthlyHeatmap } from './components/charts/MonthlyHeatmap.tsx'
import { SeasonalRadar } from './components/charts/SeasonalRadar.tsx'
import { WeekdayChart } from './components/charts/WeekdayChart.tsx'
import { DurationChart } from './components/charts/DurationChart.tsx'
import { CumulativeChart } from './components/charts/CumulativeChart.tsx'
import { MilestoneTimeline } from './components/timeline/MilestoneTimeline.tsx'
import { TripLog } from './components/table/TripLog.tsx'

export default function App() {
  const stats = useMemo(() => computeStats(meetYears), [])
  const rows = useMemo(() => flattenTrips(meetYears), [])
  const [year, setYear] = useState<YearFilter>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => filterTrips(rows, year, query), [rows, year, query])

  return (
    <DashboardShell>
      <KpiGrid stats={stats} />
      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <AnnualChart data={stats.annual} className="lg:col-span-2" />
        <MonthlyHeatmap cells={stats.heatmap} className="lg:col-span-2" />
        <SeasonalRadar data={stats.seasons} />
        <WeekdayChart data={stats.weekdays} />
        <DurationChart data={stats.durations} />
        <CumulativeChart data={stats.cumulative} />
      </div>
      <MilestoneTimeline stats={stats} />
      <TripLog
        rows={filtered}
        years={stats.annual.map((point) => point.year)}
        year={year}
        query={query}
        page={page}
        onYearChange={(nextYear) => {
          setYear(nextYear)
          setPage(1)
        }}
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery)
          setPage(1)
        }}
        onPageChange={setPage}
      />
    </DashboardShell>
  )
}
