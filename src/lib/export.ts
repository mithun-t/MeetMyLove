import type { TripRow } from '../types/reunion.ts'

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function toExportRecord(row: TripRow) {
  return {
    tripId: row.tripId,
    year: row.year,
    startDate: row.startDate,
    endDate: row.endDate,
    spanDays: row.spanDays,
    meetCount: row.meetCount,
    isMultiDayMeeting: row.isMultiDayMeeting,
    meetDates: row.meetDates,
  }
}

export function downloadTripsJson(rows: TripRow[], filename: string): void {
  const payload = JSON.stringify(rows.map(toExportRecord), null, 2)
  downloadBlob(new Blob([payload], { type: 'application/json' }), filename)
}

export function downloadTripsCsv(rows: TripRow[], filename: string): void {
  const header = [
    'tripId',
    'year',
    'startDate',
    'endDate',
    'spanDays',
    'meetCount',
    'isMultiDayMeeting',
    'meetDates',
  ]
  const lines = rows.map((row) =>
    [
      csvCell(row.tripId),
      String(row.year),
      csvCell(row.startDate),
      csvCell(row.endDate),
      String(row.spanDays),
      String(row.meetCount),
      String(row.isMultiDayMeeting),
      csvCell(row.meetDates.join(' ')),
    ].join(','),
  )
  const csv = [header.join(','), ...lines].join('\n')
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename)
}
