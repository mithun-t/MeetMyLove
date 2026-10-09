import { useState } from 'react'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Search,
  Trash2,
  X,
} from 'lucide-react'
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
  onEditTrip,
  onDeleteTrip,
}: {
  rows: TripRow[]
  years: number[]
  year: YearFilter
  query: string
  page: number
  onYearChange: (year: YearFilter) => void
  onQueryChange: (query: string) => void
  onPageChange: (page: number) => void
  onEditTrip?: (trip: TripRow) => void
  onDeleteTrip?: (tripId: string) => void
}) {
  const [tripToDelete, setTripToDelete] = useState<TripRow | null>(null)

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE
  const visible = rows.slice(start, start + PAGE_SIZE)
  const exportName = year === 'all' ? 'reunion-trips' : `reunion-trips-${year}`

  const confirmDelete = () => {
    if (tripToDelete && onDeleteTrip) {
      onDeleteTrip(tripToDelete.tripId)
      setTripToDelete(null)
    }
  }

  return (
    <section className="w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">Trip log</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Filter by year or search a trip id and date, edit records, or export matching rows.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={rows.length === 0}
            onClick={() => downloadTripsJson(rows, `${exportName}.json`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 enabled:hover:bg-stone-50 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:enabled:hover:bg-stone-750 cursor-pointer"
          >
            <Download size={15} aria-hidden="true" />
            JSON
          </button>
          <button
            type="button"
            disabled={rows.length === 0}
            onClick={() => downloadTripsCsv(rows, `${exportName}.csv`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-rose-700 disabled:opacity-40 shadow-xs cursor-pointer"
          >
            <Download size={15} aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
        <label className="block text-sm">
          <span className="mb-1 block text-stone-500 dark:text-stone-400">Year</span>
          <select
            value={year === 'all' ? 'all' : String(year)}
            onChange={(event) => {
              const value = event.target.value
              onYearChange(value === 'all' ? 'all' : Number(value))
            }}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
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
          <span className="mb-1 block text-stone-500 dark:text-stone-400">Search</span>
          <span className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-800">
            <Search size={15} className="text-stone-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Trip id or date, e.g. 2024-T18"
              className="w-full bg-transparent text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </span>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs tracking-wide text-stone-500 uppercase dark:text-stone-400">
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="px-2 py-2 font-medium">Trip ID</th>
              <th className="px-2 py-2 font-medium">Start</th>
              <th className="px-2 py-2 font-medium">End</th>
              <th className="px-2 py-2 font-medium">Duration</th>
              <th className="px-2 py-2 font-medium">Meets</th>
              <th className="px-2 py-2 font-medium">Type</th>
              <th className="px-2 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-stone-500 dark:text-stone-400">
                  No trips match this filter.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.tripId} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                  <td className="px-2 py-3 font-semibold text-stone-900 dark:text-stone-100">{row.tripId}</td>
                  <td className="px-2 py-3 text-stone-700 dark:text-stone-300">{formatMeetDate(row.startDate)}</td>
                  <td className="px-2 py-3 text-stone-700 dark:text-stone-300">{formatMeetDate(row.endDate)}</td>
                  <td className="px-2 py-3 text-stone-700 dark:text-stone-300">{row.durationLabel}</td>
                  <td className="px-2 py-3 text-stone-700 dark:text-stone-300">{row.meetCount}</td>
                  <td className="px-2 py-3">
                    {row.isMultiDayMeeting ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        Multi-day
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                        Single day
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEditTrip && (
                        <button
                          type="button"
                          onClick={() => onEditTrip(row)}
                          title={`Edit trip ${row.tripId}`}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {onDeleteTrip && (
                        <button
                          type="button"
                          onClick={() => setTripToDelete(row)}
                          title={`Delete trip ${row.tripId}`}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-stone-500 dark:text-stone-400">
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
            className="rounded-lg border border-stone-200 bg-white p-2 enabled:hover:bg-stone-50 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-800 dark:enabled:hover:bg-stone-750 cursor-pointer"
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
            className="rounded-lg border border-stone-200 bg-white p-2 enabled:hover:bg-stone-50 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-800 dark:enabled:hover:bg-stone-750 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Delete Reunion?
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    {tripToDelete.tripId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              Are you sure you want to remove reunion <strong>{tripToDelete.tripId}</strong> (
              {formatMeetDate(tripToDelete.startDate)})? All dashboard statistics and charts will be recalculated.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
