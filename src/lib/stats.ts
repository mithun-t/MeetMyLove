import { differenceInCalendarDays, getDay, getMonth, getYear, parseISO } from 'date-fns'
import type {
  AnnualPoint,
  ComputedStats,
  CumulativePoint,
  DurationBucket,
  HeatBand,
  HeatCell,
  Milestone,
  SeasonPoint,
  TripRow,
  WeekdayPoint,
  YearData,
  YearFilter,
} from '../types/reunion.ts'
import {
  WEEKDAY_LABELS,
  durationBucket,
  durationBucketOrder,
  formatChartDate,
  formatDays,
  monthLabel,
  seasonForMonth,
  seasonOrder,
} from './format.ts'

function heatBand(count: number): HeatBand {
  if (count <= 0) return 'none'
  if (count <= 2) return 'low'
  if (count <= 5) return 'mid'
  return 'high'
}

function ordinal(value: number): string {
  const mod100 = value % 100
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`
  const mod10 = value % 10
  if (mod10 === 1) return `${value}st`
  if (mod10 === 2) return `${value}nd`
  if (mod10 === 3) return `${value}rd`
  return `${value}th`
}

export function flattenTrips(years: YearData[]): TripRow[] {
  return years
    .flatMap((year) =>
      year.trips.map((trip) => {
        const sortedDates = [...trip.meetDates].sort()
        const startDate = sortedDates[0] ?? ''
        const endDate = sortedDates[sortedDates.length - 1] ?? startDate
        const spanDays =
          startDate === ''
            ? 0
            : differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1

        return {
          tripId: trip.tripId,
          year: year.year,
          meetDates: sortedDates,
          meetCount: trip.meetCount,
          isMultiDayMeeting: trip.isMultiDayMeeting,
          startDate,
          endDate,
          spanDays,
          durationLabel: formatDays(spanDays),
        }
      }),
    )
    .sort((left, right) => left.startDate.localeCompare(right.startDate))
}

export function filterTrips(rows: TripRow[], year: YearFilter, query: string): TripRow[] {
  const needle = query.trim().toLowerCase()
  return rows.filter((row) => {
    if (year !== 'all' && row.year !== year) return false
    if (needle === '') return true
    const haystack = [row.tripId, row.startDate, row.endDate, ...row.meetDates]
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
}

function buildHeatmap(years: YearData[], dates: string[]): HeatCell[] {
  const counts = new Map<string, number>()
  for (const iso of dates) {
    const date = parseISO(iso)
    const key = `${getYear(date)}-${getMonth(date)}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return years.flatMap((year) =>
    Array.from({ length: 12 }, (_, month) => {
      const count = counts.get(`${year.year}-${month}`) ?? 0
      return { year: year.year, month, count, band: heatBand(count) }
    }),
  )
}

function buildMilestones(
  rows: TripRow[],
  dates: string[],
  longestTrip: TripRow,
  busiestMonth: HeatCell,
): Milestone[] {
  const milestones: Milestone[] = [
    {
      id: 'first',
      date: dates[0] ?? rows[0].startDate,
      title: 'First reunion',
      detail: `${rows[0].tripId} is the first recorded meet day.`,
      kind: 'first',
    },
  ]

  const firstMulti = rows.find((row) => row.isMultiDayMeeting)
  if (firstMulti) {
    milestones.push({
      id: 'first-multi',
      date: firstMulti.startDate,
      title: 'First multi-day meeting',
      detail: `${firstMulti.tripId} covered ${formatDays(firstMulti.meetCount)}.`,
      kind: 'multi',
    })
  }

  const targets = [50, 100, 150, 200]
  const reached = new Set<number>()
  dates.forEach((iso, index) => {
    const count = index + 1
    for (const target of targets) {
      if (reached.has(target) || count < target) continue
      reached.add(target)
      milestones.push({
        id: `day-${target}`,
        date: iso,
        title: `${target} days together`,
        detail: `The ${ordinal(target)} meet day landed here.`,
        kind: 'century',
      })
    }
  })

  milestones.push({
    id: 'longest',
    date: longestTrip.startDate,
    title: 'Longest trip',
    detail: `${longestTrip.tripId} lasted ${formatDays(longestTrip.meetCount)}.`,
    kind: 'record',
  })

  const busiestDate =
    dates.find((iso) => {
      const date = parseISO(iso)
      return getYear(date) === busiestMonth.year && getMonth(date) === busiestMonth.month
    }) ?? `${busiestMonth.year}-${String(busiestMonth.month + 1).padStart(2, '0')}-01`

  milestones.push({
    id: 'busiest-month',
    date: busiestDate,
    title: 'Busiest month',
    detail: `${monthLabel(busiestMonth.month)} ${busiestMonth.year} held ${formatDays(busiestMonth.count)}.`,
    kind: 'record',
  })

  milestones.push({
    id: 'latest',
    date: dates[dates.length - 1] ?? rows[rows.length - 1].endDate,
    title: 'Latest reunion',
    detail: 'Most recent meet day on record.',
    kind: 'latest',
  })

  return milestones.sort(
    (left, right) => left.date.localeCompare(right.date) || left.title.localeCompare(right.title),
  )
}

export function computeStats(years: YearData[]): ComputedStats {
  const rows = flattenTrips(years)
  if (rows.length === 0) {
    throw new Error('Reunion dataset is empty')
  }

  const dates = rows.flatMap((row) => row.meetDates).sort()
  const totalMeetDays = rows.reduce((sum, row) => sum + row.meetCount, 0)
  const totalTrips = rows.length
  const multiDayTrips = rows.filter((row) => row.isMultiDayMeeting).length

  const longestTrip = rows.reduce((best, row) => {
    if (row.meetCount > best.meetCount) return row
    if (row.meetCount === best.meetCount && row.spanDays > best.spanDays) return row
    return best
  })

  const annual: AnnualPoint[] = years.map((year) => ({
    year: year.year,
    meetDays: year.trips.reduce((sum, trip) => sum + trip.meetCount, 0),
    tripCount: year.trips.length,
  }))

  const peakYear = annual.reduce((best, point) => (point.meetDays > best.meetDays ? point : best))

  const gaps = rows.slice(1).map((row, index) =>
    differenceInCalendarDays(parseISO(row.startDate), parseISO(rows[index].startDate)),
  )
  const averageGapDays = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length

  const firstDate = dates[0] ?? rows[0].startDate
  const latestDate = dates[dates.length - 1] ?? rows[rows.length - 1].endDate
  const spanDays = differenceInCalendarDays(parseISO(latestDate), parseISO(firstDate))

  const heatmap = buildHeatmap(years, dates)
  const busiestMonth = heatmap.reduce((best, cell) => (cell.count > best.count ? cell : best))

  const seasonTotals = new Map<string, number>(seasonOrder().map((season) => [season, 0]))
  const weekdayTotals = WEEKDAY_LABELS.map((day) => ({ day, meetDays: 0 }))

  for (const iso of dates) {
    const date = parseISO(iso)
    const season = seasonForMonth(getMonth(date))
    seasonTotals.set(season, (seasonTotals.get(season) ?? 0) + 1)
    weekdayTotals[getDay(date)].meetDays += 1
  }

  const seasons: SeasonPoint[] = seasonOrder().map((season) => ({
    season,
    meetDays: seasonTotals.get(season) ?? 0,
  }))

  const weekdays: WeekdayPoint[] = [
    ...weekdayTotals.slice(1),
    weekdayTotals[0],
  ]

  const bucketTotals = new Map<string, number>(durationBucketOrder().map((label) => [label, 0]))
  for (const row of rows) {
    const label = durationBucket(row.meetCount)
    bucketTotals.set(label, (bucketTotals.get(label) ?? 0) + 1)
  }
  const durations: DurationBucket[] = durationBucketOrder().map((label) => ({
    label,
    tripCount: bucketTotals.get(label) ?? 0,
  }))

  let running = 0
  const cumulative: CumulativePoint[] = rows.map((row) => {
    running += row.meetCount
    return {
      date: row.startDate,
      label: formatChartDate(row.startDate),
      tripId: row.tripId,
      total: running,
    }
  })

  return {
    totalMeetDays,
    totalTrips,
    multiDayTrips,
    multiDayShare: (multiDayTrips / totalTrips) * 100,
    averageMeetsPerTrip: totalMeetDays / totalTrips,
    longestTrip,
    peakYear,
    averageGapDays,
    spanDays,
    firstDate,
    latestDate,
    annual,
    heatmap,
    seasons,
    weekdays,
    durations,
    cumulative,
    milestones: buildMilestones(rows, dates, longestTrip, busiestMonth),
    busiestMonth,
  }
}
