import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { meetYears as initialMeetYears } from './data/meets.ts'
import { computeStats, filterTrips, flattenTrips } from './lib/stats.ts'
import { insertTripIntoYears } from './lib/meetManager.ts'
import type { Trip, YearData, YearFilter } from './types/reunion.ts'
import { DashboardShell } from './components/layout/DashboardShell.tsx'
import { KpiGrid } from './components/kpi/KpiGrid.tsx'
import { SuperlativesCard } from './components/kpi/SuperlativesCard.tsx'
import { AnnualChart } from './components/charts/AnnualChart.tsx'
import { MonthlyWiseChart } from './components/charts/MonthlyWiseChart.tsx'
import { YearOverYearChart } from './components/charts/YearOverYearChart.tsx'
import { MonthlyHeatmap } from './components/charts/MonthlyHeatmap.tsx'
import { PaceRaceChart } from './components/charts/PaceRaceChart.tsx'
import { TogetherRatioChart } from './components/charts/TogetherRatioChart.tsx'
import { WeekendRatioChart } from './components/charts/WeekendRatioChart.tsx'
import { SeasonalRadar } from './components/charts/SeasonalRadar.tsx'
import { WeekdayChart } from './components/charts/WeekdayChart.tsx'
import { DurationChart } from './components/charts/DurationChart.tsx'
import { CumulativeChart } from './components/charts/CumulativeChart.tsx'
import { GapTrendChart } from './components/charts/GapTrendChart.tsx'
import { MilestoneTimeline } from './components/timeline/MilestoneTimeline.tsx'
import { FutureProjectionsCard } from './components/timeline/FutureProjectionsCard.tsx'
import { TripLog } from './components/table/TripLog.tsx'
import { AddMeetModal } from './components/forms/AddMeetModal.tsx'

export default function App() {
  const [years, setYears] = useState<YearData[]>(initialMeetYears)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const stats = useMemo(() => computeStats(years), [years])
  const rows = useMemo(() => flattenTrips(years), [years])
  const [year, setYear] = useState<YearFilter>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => filterTrips(rows, year, query), [rows, year, query])

  const handleAddMeet = async (newTrip: Trip, targetYear: number): Promise<boolean> => {
    const updatedYears = insertTripIntoYears(years, newTrip, targetYear)
    try {
      const response = await fetch('/api/meets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedYears),
      })

      if (response.ok) {
        setYears(updatedYears)
        return true
      }
    } catch {
      // In static preview / production without dev server
    }

    // Always update client state so user sees the change
    setYears(updatedYears)
    return true
  }

  return (
    <DashboardShell
      action={
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
        >
          <Plus size={16} aria-hidden="true" />
          Add Meet
        </button>
      }
    >
      <KpiGrid stats={stats} />
      <SuperlativesCard stats={stats} rows={rows} />
      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <AnnualChart data={stats.annual} className="lg:col-span-2" />
        <MonthlyWiseChart
          rows={rows}
          years={stats.annual.map((point) => point.year)}
          className="lg:col-span-2"
        />
        <YearOverYearChart cells={stats.heatmap} className="lg:col-span-2" />
        <PaceRaceChart
          rows={rows}
          years={stats.annual.map((point) => point.year)}
          className="lg:col-span-2"
        />
        <TogetherRatioChart
          rows={rows}
          years={stats.annual.map((point) => point.year)}
        />
        <WeekendRatioChart
          rows={rows}
          years={stats.annual.map((point) => point.year)}
        />
        <MonthlyHeatmap cells={stats.heatmap} className="lg:col-span-2" />
        <SeasonalRadar data={stats.seasons} />
        <WeekdayChart data={stats.weekdays} />
        <DurationChart data={stats.durations} />
        <CumulativeChart data={stats.cumulative} />
        <GapTrendChart
          data={stats.gaps}
          years={stats.annual.map((point) => point.year)}
          className="lg:col-span-2"
        />
      </div>
      <FutureProjectionsCard stats={stats} rows={rows} />
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

      <AddMeetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        years={years}
        onSubmit={handleAddMeet}
      />
    </DashboardShell>
  )
}

