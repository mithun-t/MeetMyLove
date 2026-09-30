import { useState } from 'react'
import type { HeatCell } from '../../types/reunion.ts'
import { MONTH_LABELS, formatDays, monthLabel } from '../../lib/format.ts'
import { ChartCard } from './ChartCard.tsx'

const bandClass: Record<HeatCell['band'], string> = {
  none: 'bg-stone-100',
  low: 'bg-rose-200',
  mid: 'bg-rose-400',
  high: 'bg-rose-700',
}

export function MonthlyHeatmap({ cells, className }: { cells: HeatCell[]; className?: string }) {
  const years = [...new Set(cells.map((cell) => cell.year))]
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const active = cells.find((cell) => `${cell.year}-${cell.month}` === activeKey) ?? null

  return (
    <ChartCard
      className={className}
      title="Monthly heatmap"
      subtitle="Each tile is one month. Color tracks meet days: 0, 1–2, 3–5, and 6+."
    >
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[3.5rem_repeat(12,minmax(0,1fr))] gap-1.5 text-center text-[11px] text-stone-500">
            <span />
            {MONTH_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
            {years.map((year) => (
              <YearRow
                key={year}
                year={year}
                cells={cells.filter((cell) => cell.year === year)}
                activeKey={activeKey}
                onSelect={setActiveKey}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-500">
        <span>Less</span>
        <span className="h-3.5 w-3.5 rounded bg-stone-100" />
        <span className="h-3.5 w-3.5 rounded bg-rose-200" />
        <span className="h-3.5 w-3.5 rounded bg-rose-400" />
        <span className="h-3.5 w-3.5 rounded bg-rose-700" />
        <span>More</span>
        <p className="min-h-4 flex-1 text-right text-stone-700">
          {active
            ? `${monthLabel(active.month)} ${active.year}: ${formatDays(active.count)}`
            : 'Select a month to read its count'}
        </p>
      </div>
    </ChartCard>
  )
}

function YearRow({
  year,
  cells,
  activeKey,
  onSelect,
}: {
  year: number
  cells: HeatCell[]
  activeKey: string | null
  onSelect: (key: string) => void
}) {
  return (
    <>
      <span className="self-center text-left font-medium text-stone-700">{year}</span>
      {cells.map((cell) => {
        const key = `${cell.year}-${cell.month}`
        const selected = key === activeKey
        return (
          <button
            key={key}
            type="button"
            aria-label={`${monthLabel(cell.month)} ${cell.year}, ${formatDays(cell.count)}`}
            aria-pressed={selected}
            onClick={() => onSelect(key)}
            className={`h-8 rounded-md ${bandClass[cell.band]} ${selected ? 'ring-2 ring-stone-900 ring-offset-1' : ''}`}
          />
        )
      })}
    </>
  )
}
