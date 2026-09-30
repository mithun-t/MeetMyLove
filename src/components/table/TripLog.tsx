import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import type { TripRow, YearFilter } from '../../types/reunion.ts'
import { formatMeetDate } from '../../lib/format.ts'
import { downloadTripsCsv, downloadTripsJson } from '../../lib/export.ts'

const PAGE_SIZE = 10

export function TripLog({
  rows,
  years,
  year,
  query,
  page,
  onYearChange,
  onQueryChange,
  onPageChange,
}: {
  rows: TripRow[]
  years: number[]
  year: YearFilter
  query: string
  page: number
  onYearChange: (year: YearFilter) => void
  onQueryChange: (query: string) => void
  onPageChange: (page: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE
  const visible = rows.slice(start, start + PAGE_SIZE)
  const exportName = year === 'all' ? 'reunion-trips' : `reunion-trips-${year}`

  return (
    <section className="w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Trip log</h2>
          <p className="mt-1 text-sm text-stone-500">
            Filter by year or search a trip id and date, then export the matching rows.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={rows.length === 0}
            onClick={() => downloadTripsJson(rows, `${exportName}.json`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 enabled:hover:bg-stone-50 disabled:opacity-40"
          >
            <Download size={15} aria-hidden="true" />
            JSON
          </button>
          <button
            type="button"
            disabled={rows.length === 0}
            onClick={() => downloadTripsCsv(rows, `${exportName}.csv`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-rose-700 disabled:opacity-40"
          >
            <Download size={15} aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
        <label className="block text-sm">
          <span className="mb-1 block text-stone-500">Year</span>
          <select
            value={year === 'all' ? 'all' : String(year)}
            onChange={(event) => {
              const value = event.target.value
              onYearChange(value === 'all' ? 'all' : Number(value))
            }}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-800"
          >
            <option value="all">All</option>
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-stone-500">Search</span>
          <span className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2">
            <Search size={15} className="text-stone-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Trip id or date, e.g. 2024-T18"
              className="w-full bg-transparent text-stone-800 outline-none placeholder:text-stone-400"
            />
          </span>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-wide text-stone-500 uppercase">
            <tr className="border-b border-stone-200">
              <th className="px-2 py-2 font-medium">Trip ID</th>
              <th className="px-2 py-2 font-medium">Start</th>
              <th className="px-2 py-2 font-medium">End</th>
              <th className="px-2 py-2 font-medium">Duration</th>
              <th className="px-2 py-2 font-medium">Meets</th>
              <th className="px-2 py-2 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-8 text-center text-stone-500">
                  No trips match this filter.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.tripId} className="border-b border-stone-100">
                  <td className="px-2 py-3 font-medium text-stone-900">{row.tripId}</td>
                  <td className="px-2 py-3">{formatMeetDate(row.startDate)}</td>
                  <td className="px-2 py-3">{formatMeetDate(row.endDate)}</td>
                  <td className="px-2 py-3">{row.durationLabel}</td>
                  <td className="px-2 py-3">{row.meetCount}</td>
                  <td className="px-2 py-3">
                    {row.isMultiDayMeeting ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                        Multi-day
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                        Single day
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-stone-500">
        <p>
          {rows.length === 0
            ? '0 trips'
            : `Showing ${start + 1}–${start + visible.length} of ${rows.length}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-lg border border-stone-200 p-2 enabled:hover:bg-stone-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg border border-stone-200 p-2 enabled:hover:bg-stone-50 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
