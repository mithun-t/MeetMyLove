import { format, parseISO } from 'date-fns'

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const SEASON_MONTHS = [
  { season: 'Winter', months: [11, 0, 1] },
  { season: 'Spring', months: [2, 3, 4] },
  { season: 'Summer', months: [5, 6, 7] },
  { season: 'Autumn', months: [8, 9, 10] },
] as const

const DURATION_BUCKETS = ['1 day', '2 days', '3 days', '4–5 days', '6+ days'] as const

export function monthLabel(monthIndex: number): string {
  return MONTH_LABELS[monthIndex] ?? ''
}

export function formatMeetDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy')
}

export function formatChartDate(iso: string): string {
  return format(parseISO(iso), 'MMM yyyy')
}

export function formatCount(value: number, digits = 0): string {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function formatDays(count: number): string {
  return `${formatCount(count)} ${count === 1 ? 'day' : 'days'}`
}

export function formatPercent(value: number): string {
  return `${formatCount(value, 0)}%`
}

export function seasonForMonth(monthIndex: number): string {
  const match = SEASON_MONTHS.find((entry) =>
    (entry.months as readonly number[]).includes(monthIndex),
  )
  return match?.season ?? 'Winter'
}

export function durationBucket(meetCount: number): (typeof DURATION_BUCKETS)[number] {
  if (meetCount <= 1) return '1 day'
  if (meetCount === 2) return '2 days'
  if (meetCount === 3) return '3 days'
  if (meetCount <= 5) return '4–5 days'
  return '6+ days'
}

export function durationBucketOrder(): readonly string[] {
  return DURATION_BUCKETS
}

export function seasonOrder(): readonly string[] {
  return SEASON_MONTHS.map((entry) => entry.season)
}
