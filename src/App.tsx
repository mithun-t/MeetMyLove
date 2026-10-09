import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { meetYears as initialMeetYears } from './data/meets.ts'
import { computeStats, filterTrips, flattenTrips } from './lib/stats.ts'
import {
  deleteTripFromYears,
  insertTripIntoYears,
  updateTripInYears,
} from './lib/meetManager.ts'
import type { Trip, TripRow, YearData, YearFilter } from './types/reunion.ts'
import { useDarkMode } from './hooks/useDarkMode.ts'
import { DashboardShell } from './components/layout/DashboardShell.tsx'
import { BottomNav } from './components/layout/BottomNav.tsx'
import { LoveStoryPanel } from './components/layout/LoveStoryPanel.tsx'
import { AnniversaryCard } from './components/timeline/AnniversaryCard.tsx'
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
import { GrowthRateChart } from './components/charts/GrowthRateChart.tsx'
import { FullCalendarHeatmap } from './components/charts/FullCalendarHeatmap.tsx'
import { StreakTrackerCard } from './components/charts/StreakTrackerCard.tsx'
import { MilestoneTimeline } from './components/timeline/MilestoneTimeline.tsx'
import { FutureProjectionsCard } from './components/timeline/FutureProjectionsCard.tsx'
import { TripLog } from './components/table/TripLog.tsx'
import { AddMeetModal } from './components/forms/AddMeetModal.tsx'

export default function App() {
  const { isDark, toggleDark } = useDarkMode()
  const [years, setYears] = useState<YearData[]>(initialMeetYears)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [tripToEdit, setTripToEdit] = useState<TripRow | null>(null)

  const stats = useMemo(() => computeStats(years), [years])
  const rows = useMemo(() => flattenTrips(years), [years])
  const [year, setYear] = useState<YearFilter>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => filterTrips(rows, year, query), [rows, year, query])

  const syncYearsToServer = async (updatedYears: YearData[]) => {
    try {
      await fetch('/api/meets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedYears),
      })
    } catch {
      // In production / preview mode
    }
  }

  const handleSaveMeet = async (
    newTrip: Trip,
    targetYear: number,
    originalTripId?: string,
  ): Promise<boolean> => {
    let updatedYears: YearData[]
    if (originalTripId) {
      updatedYears = updateTripInYears(years, newTrip, originalTripId, targetYear)
    } else {
      updatedYears = insertTripIntoYears(years, newTrip, targetYear)
    }

    setYears(updatedYears)
    await syncYearsToServer(updatedYears)
    return true
  }

  const handleDeleteTrip = async (tripId: string) => {
    const updatedYears = deleteTripFromYears(years, tripId)
    setYears(updatedYears)
    await syncYearsToServer(updatedYears)
  }

  const handleOpenAddModal = () => {
    setTripToEdit(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (row: TripRow) => {
    setTripToEdit(row)
    setIsAddModalOpen(true)
  }

  const handleExportPdf = () => {
    window.print()
  }

  const allYearsList = useMemo(() => {
    return stats.annual.map((point) => point.year)
  }, [stats.annual])

  return (
    <DashboardShell
      isDark={isDark}
      onToggleDark={toggleDark}
      onExportPdf={handleExportPdf}
      action={
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add Meet</span>
        </button>
      }
    >
      {/* Printable Header Banner (visible only during Print / PDF Export) */}
      <div className="hidden print:block pb-4 mb-2 border-b border-stone-200">
        <h1 className="text-2xl font-bold text-stone-900">MeetMyLove — Reunion Analytics Report</h1>
        <p className="text-xs text-stone-600 mt-1">
          Journey from October 30, 2021 through 2026 • {stats.totalMeetDays} Days Together • {stats.totalTrips} Reunions
        </p>
      </div>

      {/* Section 1: Overview & KPIs */}
      <section id="overview" className="flex flex-col gap-6">
        <KpiGrid stats={stats} />
        <SuperlativesCard stats={stats} rows={rows} />
      </section>

      {/* Section 2: Love Story Narrative & Anniversaries */}
      <section id="story" className="flex flex-col gap-6">
        <LoveStoryPanel stats={stats} rows={rows} />
        <AnniversaryCard stats={stats} rows={rows} />
      </section>

      {/* Section 3: Visual Analytics & Deep Trends */}
      <section id="charts" className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <AnnualChart data={stats.annual} className="lg:col-span-2" />
        <MonthlyWiseChart
          rows={rows}
          years={allYearsList}
          className="lg:col-span-2"
        />
        <GrowthRateChart
          cells={stats.heatmap}
          years={allYearsList}
          className="lg:col-span-2"
        />
        <YearOverYearChart cells={stats.heatmap} className="lg:col-span-2" />
        <PaceRaceChart
          rows={rows}
          years={allYearsList}
          className="lg:col-span-2"
        />
        <TogetherRatioChart
          rows={rows}
          years={allYearsList}
        />
        <WeekendRatioChart
          rows={rows}
          years={allYearsList}
        />
        <MonthlyHeatmap cells={stats.heatmap} className="lg:col-span-2" />
        <SeasonalRadar data={stats.seasons} />
        <WeekdayChart data={stats.weekdays} />
        <DurationChart data={stats.durations} />
        <CumulativeChart data={stats.cumulative} />
        <GapTrendChart
          data={stats.gaps}
          years={allYearsList}
          className="lg:col-span-2"
        />
      </section>

      {/* Section 4: Contribution Calendar & Consistency */}
      <section id="calendar" className="flex flex-col gap-6">
        <FullCalendarHeatmap rows={rows} years={allYearsList} />
        <StreakTrackerCard cells={stats.heatmap} />
      </section>

      {/* Section 5: Future Milestones & Timeline */}
      <section id="milestones" className="flex flex-col gap-6">
        <FutureProjectionsCard stats={stats} rows={rows} />
        <MilestoneTimeline stats={stats} />
      </section>

      {/* Section 6: Comprehensive Trip Log */}
      <section id="log">
        <TripLog
          rows={filtered}
          years={allYearsList}
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
          onEditTrip={handleOpenEditModal}
          onDeleteTrip={handleDeleteTrip}
        />
      </section>

      {/* Add / Edit Meet Modal */}
      <AddMeetModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setTripToEdit(null)
        }}
        years={years}
        tripToEdit={tripToEdit}
        onSubmit={handleSaveMeet}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav onAddClick={handleOpenAddModal} />
    </DashboardShell>
  )
}
