export interface Trip {
  tripId: string
  meetDates: string[]
  meetCount: number
  isMultiDayMeeting: boolean
}

export interface YearData {
  year: number
  trips: Trip[]
}

export interface TripRow {
  tripId: string
  year: number
  meetDates: string[]
  meetCount: number
  isMultiDayMeeting: boolean
  startDate: string
  endDate: string
  spanDays: number
  durationLabel: string
}

export type YearFilter = number | 'all'

export type HeatBand = 'none' | 'low' | 'mid' | 'high'

export interface AnnualPoint {
  year: number
  meetDays: number
  tripCount: number
}

export interface HeatCell {
  year: number
  month: number
  count: number
  band: HeatBand
}

export interface SeasonPoint {
  season: string
  meetDays: number
}

export interface WeekdayPoint {
  day: string
  meetDays: number
}

export interface DurationBucket {
  label: string
  tripCount: number
}

export interface CumulativePoint {
  date: string
  label: string
  tripId: string
  total: number
}

export type MilestoneKind = 'first' | 'multi' | 'century' | 'record' | 'latest'

export interface Milestone {
  id: string
  date: string
  title: string
  detail: string
  kind: MilestoneKind
}

export interface ComputedStats {
  totalMeetDays: number
  totalTrips: number
  multiDayTrips: number
  multiDayShare: number
  averageMeetsPerTrip: number
  longestTrip: TripRow
  peakYear: AnnualPoint
  averageGapDays: number
  spanDays: number
  firstDate: string
  latestDate: string
  annual: AnnualPoint[]
  heatmap: HeatCell[]
  seasons: SeasonPoint[]
  weekdays: WeekdayPoint[]
  durations: DurationBucket[]
  cumulative: CumulativePoint[]
  milestones: Milestone[]
  busiestMonth: HeatCell
}
