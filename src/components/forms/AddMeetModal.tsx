import { useState, useId, useMemo } from 'react'
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Sparkles,
  Edit3,
} from 'lucide-react'
import type { Trip, TripRow, YearData } from '../../types/reunion.ts'
import {
  type MeetFormInput,
  generateNextTripId,
  validateMeetInput,
} from '../../lib/meetManager.ts'

interface AddMeetModalProps {
  isOpen: boolean
  onClose: () => void
  years: YearData[]
  tripToEdit?: TripRow | null
  onSubmit: (newTrip: Trip, targetYear: number, originalTripId?: string) => Promise<boolean>
}

interface FormInnerProps {
  onClose: () => void
  years: YearData[]
  tripToEdit?: TripRow | null
  onSubmit: (newTrip: Trip, targetYear: number, originalTripId?: string) => Promise<boolean>
}

function AddMeetFormInner({ onClose, years, tripToEdit, onSubmit }: FormInnerProps) {
  const isEditing = Boolean(tripToEdit)

  const [mode, setMode] = useState<'single' | 'range' | 'custom'>(() => {
    if (!tripToEdit) return 'single'
    return tripToEdit.meetDates.length === 1 ? 'single' : 'range'
  })

  const [singleDate, setSingleDate] = useState(() => {
    if (tripToEdit?.startDate) return tripToEdit.startDate
    return new Date().toISOString().slice(0, 10)
  })

  const [startDate, setStartDate] = useState(() => {
    if (tripToEdit?.startDate) return tripToEdit.startDate
    return new Date().toISOString().slice(0, 10)
  })

  const [endDate, setEndDate] = useState(() => {
    if (tripToEdit?.endDate) return tripToEdit.endDate
    return new Date().toISOString().slice(0, 10)
  })

  const [customDates, setCustomDates] = useState<string[]>(() => {
    if (tripToEdit?.meetDates) return [...tripToEdit.meetDates]
    return [new Date().toISOString().slice(0, 10)]
  })

  const [newCustomDate, setNewCustomDate] = useState('')
  const [tripId, setTripId] = useState(() => tripToEdit?.tripId ?? '')
  const [autoGenerateId, setAutoGenerateId] = useState(() => !tripToEdit)
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
      editingTripId: tripToEdit?.tripId,
    }),
    [mode, singleDate, startDate, endDate, customDates, tripId, autoGenerateId, tripToEdit],
  )

  const validation = useMemo(
    () => validateMeetInput(formInput, years),
    [formInput, years],
  )

  const suggestedTripId = useMemo(
    () => generateNextTripId(years, validation.resolvedYear),
    [years, validation.resolvedYear],
  )

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
      const success = await onSubmit(newTrip, validation.resolvedYear, tripToEdit?.tripId)
      if (success) {
        setStatusMessage({
          type: 'success',
          text: `Trip ${finalTripId} ${isEditing ? 'updated' : 'saved'} successfully!`,
        })
        setTimeout(() => {
          onClose()
          setStatusMessage(null)
          setTouched(false)
        }, 800)
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to write to file. Please check console or export JSON.',
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
    <div className="relative w-full max-w-xl my-8 rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col dark:border-stone-800 dark:bg-stone-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-850/60">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            {isEditing ? <Edit3 size={18} aria-hidden="true" /> : <Calendar size={18} aria-hidden="true" />}
          </span>
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {isEditing ? 'Edit Reunion Entry' : 'Add New Reunion Entry'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isEditing ? `Modifying ${tripToEdit?.tripId}` : 'Log a single meet or multi-day trip'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-120px)]">
        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wide">
            Meeting Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                mode === 'single'
                  ? 'border-rose-500 bg-rose-50/80 text-rose-700 shadow-xs dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-400'
              }`}
            >
              Single Day
            </button>
            <button
              type="button"
              onClick={() => setMode('range')}
              className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                mode === 'range'
                  ? 'border-rose-500 bg-rose-50/80 text-rose-700 shadow-xs dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-400'
              }`}
            >
              Date Range
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                mode === 'custom'
                  ? 'border-rose-500 bg-rose-50/80 text-rose-700 shadow-xs dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-400'
              }`}
            >
              Custom Dates
            </button>
          </div>
        </div>

        {/* Date Picker Section */}
        <div className="space-y-3">
          {mode === 'single' && (
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                Reunion Date
              </label>
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-rose-500 dark:border-stone-750 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
          )}

          {mode === 'range' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-rose-500 dark:border-stone-750 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-rose-500 dark:border-stone-750 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {mode === 'custom' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                Add Dates to Trip
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newCustomDate}
                  onChange={(e) => setNewCustomDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-rose-500 dark:border-stone-750 dark:bg-stone-800 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDate}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-750 dark:text-stone-200 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {customDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {customDates.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg border border-stone-200 dark:border-stone-700"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomDate(d)}
                        className="text-stone-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trip ID Customization */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
              Trip Identifier
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateId}
                onChange={(e) => setAutoGenerateId(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              Auto-generate ID
            </label>
          </div>

          {autoGenerateId ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-850/60 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Suggested Identifier:
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                {suggestedTripId}
              </span>
            </div>
          ) : (
            <input
              type="text"
              placeholder="e.g. 2026-T21"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-rose-500 dark:border-stone-750 dark:bg-stone-800 dark:text-stone-100"
            />
          )}
        </div>

        {/* Validation Errors Preview */}
        {touched && Object.keys(validation.errors).length > 0 && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1">
            {Object.values(validation.errors).map((err, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Summary Preview Banner */}
        {validation.isValid && (
          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/40 text-xs space-y-1">
            <div className="flex items-center justify-between font-medium text-stone-700 dark:text-stone-300">
              <span>Trip ID:</span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                {autoGenerateId ? suggestedTripId : validation.resolvedTripId}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
              <span>Total meet days:</span>
              <span>
                <strong>{validation.resolvedDates.length}</strong> {validation.isMultiDay ? '(Multi-day)' : '(Single day)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
              <span>Year assignment:</span>
              <span>{validation.resolvedYear}</span>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              'Saving...'
            ) : isEditing ? (
              <>
                <CheckCircle2 size={14} /> Save Changes
              </>
            ) : (
              <>
                <Plus size={14} /> Save Reunion Entry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export function AddMeetModal({
  isOpen,
  onClose,
  years,
  tripToEdit,
  onSubmit,
}: AddMeetModalProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity overflow-y-auto"
    >
      <AddMeetFormInner
        key={tripToEdit?.tripId ?? 'new'}
        onClose={onClose}
        years={years}
        tripToEdit={tripToEdit}
        onSubmit={onSubmit}
      />
    </div>
  )
}
