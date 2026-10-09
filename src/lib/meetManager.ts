import type { Trip, YearData } from '../types/reunion.ts'

export interface MeetFormInput {
  mode: 'single' | 'range' | 'custom'
  singleDate: string
  startDate: string
  endDate: string
  customDates: string[]
  tripId: string
  autoGenerateId: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  resolvedDates: string[]
  resolvedYear: number
  resolvedTripId: string
  isMultiDay: boolean
}

export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const curr = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  if (isNaN(curr.getTime()) || isNaN(end.getTime()) || curr > end) {
    return []
  }

  while (curr <= end) {
    const year = curr.getFullYear()
    const month = String(curr.getMonth() + 1).padStart(2, '0')
    const day = String(curr.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
    curr.setDate(curr.getDate() + 1)
  }

  return dates
}

export function generateNextTripId(years: YearData[], targetYear: number): string {
  const yearEntry = years.find((y) => y.year === targetYear)
  if (!yearEntry || yearEntry.trips.length === 0) {
    return `${targetYear}-T1`
  }

  let maxNum = 0
  const pattern = new RegExp(`^${targetYear}-T(\\d+)$`)

  for (const trip of yearEntry.trips) {
    const match = trip.tripId.match(pattern)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) {
        maxNum = num
      }
    }
  }

  return `${targetYear}-T${maxNum + 1}`
}

export function validateMeetInput(
  input: MeetFormInput,
  existingYears: YearData[],
): ValidationResult {
  const errors: Record<string, string> = {}
  let resolvedDates: string[] = []

  if (input.mode === 'single') {
    if (!input.singleDate) {
      errors.singleDate = 'Please select a date for the meet.'
    } else {
      resolvedDates = [input.singleDate]
    }
  } else if (input.mode === 'range') {
    if (!input.startDate) {
      errors.startDate = 'Please select a start date.'
    }
    if (!input.endDate) {
      errors.endDate = 'Please select an end date.'
    }

    if (input.startDate && input.endDate) {
      if (input.endDate < input.startDate) {
        errors.endDate = 'End date cannot be earlier than start date.'
      } else {
        resolvedDates = getDatesBetween(input.startDate, input.endDate)
      }
    }
  } else if (input.mode === 'custom') {
    const cleanDates = input.customDates.filter((d) => Boolean(d?.trim()))
    if (cleanDates.length === 0) {
      errors.customDates = 'Please specify at least one date.'
    } else {
      resolvedDates = Array.from(new Set(cleanDates)).sort()
    }
  }

  // Resolve Year
  let resolvedYear = new Date().getFullYear()
  if (resolvedDates.length > 0) {
    const firstYear = parseInt(resolvedDates[0].slice(0, 4), 10)
    resolvedYear = firstYear

    // Ensure all dates belong to the same year or note span
    const inconsistent = resolvedDates.some(
      (d) => parseInt(d.slice(0, 4), 10) !== firstYear,
    )
    if (inconsistent) {
      errors.dates = 'All dates in a trip should belong to the same calendar year.'
    }
  }

  // Resolve Trip ID
  let resolvedTripId = input.tripId.trim()
  if (input.autoGenerateId || !resolvedTripId) {
    resolvedTripId = generateNextTripId(existingYears, resolvedYear)
  }

  if (!resolvedTripId) {
    errors.tripId = 'Trip ID cannot be empty.'
  } else {
    // Check if tripId already exists in this year
    const yearEntry = existingYears.find((y) => y.year === resolvedYear)
    if (yearEntry && yearEntry.trips.some((t) => t.tripId.toLowerCase() === resolvedTripId.toLowerCase())) {
      errors.tripId = `Trip ID "${resolvedTripId}" already exists for ${resolvedYear}.`
    }
  }

  const isMultiDay = resolvedDates.length > 1

  return {
    isValid: Object.keys(errors).length === 0 && resolvedDates.length > 0,
    errors,
    resolvedDates,
    resolvedYear,
    resolvedTripId,
    isMultiDay,
  }
}

export function insertTripIntoYears(
  years: YearData[],
  newTrip: Trip,
  targetYear: number,
): YearData[] {
  const cloned: YearData[] = JSON.parse(JSON.stringify(years))
  let yearEntry = cloned.find((y) => y.year === targetYear)

  if (!yearEntry) {
    yearEntry = {
      year: targetYear,
      trips: [],
    }
    cloned.push(yearEntry)
    cloned.sort((a, b) => a.year - b.year)
  }

  yearEntry.trips.push(newTrip)

  // Sort trips in year by first meetDate, then tripId
  yearEntry.trips.sort((a, b) => {
    const dateA = a.meetDates[0] ?? ''
    const dateB = b.meetDates[0] ?? ''
    if (dateA !== dateB) return dateA.localeCompare(dateB)
    return a.tripId.localeCompare(b.tripId, undefined, { numeric: true })
  })

  return cloned
}
