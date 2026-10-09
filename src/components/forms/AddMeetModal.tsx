import { useState, useId, useMemo } from 'react'
import {
  Calendar,
  CalendarRange,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react'
import type { Trip, YearData } from '../../types/reunion.ts'
import {
  type MeetFormInput,
  generateNextTripId,
  validateMeetInput,
} from '../../lib/meetManager.ts'

interface AddMeetModalProps {
  isOpen: boolean
  onClose: () => void
  years: YearData[]
  onSubmit: (newTrip: Trip, targetYear: number) => Promise<boolean>
}

export function AddMeetModal({ isOpen, onClose, years, onSubmit }: AddMeetModalProps) {
  const [mode, setMode] = useState<'single' | 'range' | 'custom'>('single')
  const [singleDate, setSingleDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [customDates, setCustomDates] = useState<string[]>(() => [
    new Date().toISOString().slice(0, 10),
  ])
  const [newCustomDate, setNewCustomDate] = useState('')
  const [tripId, setTripId] = useState('')
  const [autoGenerateId, setAutoGenerateId] = useState(true)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const titleId = useId()

  const formInput: MeetFormInput = useMemo(
    () => ({
      mode,
      singleDate,
      startDate,
      endDate,
      customDates,
      tripId,
      autoGenerateId,
    }),
    [mode, singleDate, startDate, endDate, customDates, tripId, autoGenerateId],
  )

  const validation = useMemo(
    () => validateMeetInput(formInput, years),
    [formInput, years],
  )

  const suggestedTripId = useMemo(
    () => generateNextTripId(years, validation.resolvedYear),
    [years, validation.resolvedYear],
  )

  if (!isOpen) return null

  const handleAddCustomDate = () => {
    if (!newCustomDate) return
    if (!customDates.includes(newCustomDate)) {
      setCustomDates([...customDates, newCustomDate].sort())
    }
    setNewCustomDate('')
  }

  const handleRemoveCustomDate = (dateToRemove: string) => {
    setCustomDates(customDates.filter((d) => d !== dateToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setStatusMessage(null)

    if (!validation.isValid) {
      return
    }

    setSubmitting(true)

    const finalTripId = autoGenerateId ? suggestedTripId : validation.resolvedTripId

    const newTrip: Trip = {
      tripId: finalTripId,
      meetDates: validation.resolvedDates,
      meetCount: validation.resolvedDates.length,
      isMultiDayMeeting: validation.isMultiDay,
    }

    try {
      const success = await onSubmit(newTrip, validation.resolvedYear)
      if (success) {
        setStatusMessage({ type: 'success', text: `Trip ${finalTripId} saved successfully!` })
        setTimeout(() => {
          onClose()
          setStatusMessage(null)
          setTouched(false)
        }, 800)
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to write to file. Please check console or download JSON export.',
        })
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred while saving.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-8 rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 text-rose-600">
              <Calendar size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-stone-900">
                Add Meet Entry
              </h2>
              <p className="text-xs text-stone-500">
                Log a new meet or trip and update meets.json
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`flex items-center gap-2.5 rounded-xl p-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Trip Type
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  mode === 'single'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Calendar size={14} />
                Single Day
              </button>
              <button
                type="button"
                onClick={() => setMode('range')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  mode === 'range'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CalendarRange size={14} />
                Consecutive
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  mode === 'custom'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Plus size={14} />
                Custom Dates
              </button>
            </div>
          </div>

          {/* Date Picker Controls depending on mode */}
          {mode === 'single' && (
            <div>
              <label htmlFor="single-date-input" className="block text-sm font-medium text-stone-700 mb-1">
                Meet Date
              </label>
              <input
                id="single-date-input"
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-sm text-stone-800 focus:outline-hidden focus:ring-2 ${
                  touched && validation.errors.singleDate
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-stone-300 focus:border-rose-500 focus:ring-rose-100'
                }`}
              />
              {touched && validation.errors.singleDate && (
                <p className="mt-1 text-xs text-rose-600">{validation.errors.singleDate}</p>
              )}
            </div>
          )}

          {mode === 'range' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-date-input" className="block text-sm font-medium text-stone-700 mb-1">
                  Start Date
                </label>
                <input
                  id="start-date-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm text-stone-800 focus:outline-hidden focus:ring-2 ${
                    touched && validation.errors.startDate
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-stone-300 focus:border-rose-500 focus:ring-rose-100'
                  }`}
                />
                {touched && validation.errors.startDate && (
                  <p className="mt-1 text-xs text-rose-600">{validation.errors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="end-date-input" className="block text-sm font-medium text-stone-700 mb-1">
                  End Date
                </label>
                <input
                  id="end-date-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm text-stone-800 focus:outline-hidden focus:ring-2 ${
                    touched && validation.errors.endDate
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-stone-300 focus:border-rose-500 focus:ring-rose-100'
                  }`}
                />
                {touched && validation.errors.endDate && (
                  <p className="mt-1 text-xs text-rose-600">{validation.errors.endDate}</p>
                )}
              </div>
            </div>
          )}

          {mode === 'custom' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="add-custom-date-input" className="block text-sm font-medium text-stone-700 mb-1">
                  Add Dates to Trip
                </label>
                <div className="flex gap-2">
                  <input
                    id="add-custom-date-input"
                    type="date"
                    value={newCustomDate}
                    onChange={(e) => setNewCustomDate(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDate}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs transition-colors"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {customDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                  {customDates.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 shadow-2xs"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomDate(d)}
                        className="text-stone-400 hover:text-rose-600"
                        title="Remove date"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {touched && validation.errors.customDates && (
                <p className="text-xs text-rose-600">{validation.errors.customDates}</p>
              )}
            </div>
          )}

          {/* Cross-date validation warning if any */}
          {validation.errors.dates && (
            <p className="text-xs text-rose-600">{validation.errors.dates}</p>
          )}

          {/* Trip ID control */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                  Trip Identifier
                </label>
                <p className="text-xs text-stone-500">
                  Target year: <span className="font-semibold text-stone-700">{validation.resolvedYear}</span>
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoGenerateId}
                  onChange={(e) => setAutoGenerateId(e.target.checked)}
                  className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                />
                Auto-generate
              </label>
            </div>

            {autoGenerateId ? (
              <div className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm">
                <span className="font-mono font-medium text-stone-700">{suggestedTripId}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
                  <Sparkles size={11} /> Auto Next ID
                </span>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder={`e.g. ${suggestedTripId}`}
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  className={`w-full rounded-xl border bg-white px-3 py-2 text-sm font-mono text-stone-800 focus:outline-hidden focus:ring-2 ${
                    touched && validation.errors.tripId
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-stone-300 focus:border-rose-500 focus:ring-rose-100'
                  }`}
                />
                {touched && validation.errors.tripId && (
                  <p className="mt-1 text-xs text-rose-600">{validation.errors.tripId}</p>
                )}
              </div>
            )}
          </div>

          {/* Live Preview Card */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">
                Preview Entry
              </span>
              <p className="text-sm font-semibold text-stone-900">
                {autoGenerateId ? suggestedTripId : validation.resolvedTripId || '–'}
              </p>
              <p className="text-xs text-stone-600">
                {validation.resolvedDates.length > 0
                  ? `${validation.resolvedDates.length} day${
                      validation.resolvedDates.length > 1 ? 's' : ''
                    } (${validation.resolvedDates[0]}${
                      validation.resolvedDates.length > 1
                        ? ` to ${validation.resolvedDates[validation.resolvedDates.length - 1]}`
                        : ''
                    })`
                  : 'No dates selected yet'}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                  validation.isMultiDay
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {validation.isMultiDay ? 'Multi-day' : 'Single day'}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Meet Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
