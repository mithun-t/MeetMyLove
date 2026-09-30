import { CalendarHeart, Flag, Moon, Sparkles, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ComputedStats, Milestone, MilestoneKind } from '../../types/reunion.ts'
import { formatDays, formatMeetDate, monthLabel } from '../../lib/format.ts'

const kindIcon: Record<MilestoneKind, LucideIcon> = {
  first: Flag,
  multi: Moon,
  century: Sparkles,
  record: Trophy,
  latest: CalendarHeart,
}

export function MilestoneTimeline({ stats }: { stats: ComputedStats }) {
  return (
    <section className="w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-stone-900">Milestones and records</h2>
      <p className="mt-1 text-sm text-stone-500">
        Thresholds and records walked in date order from the trip log.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RecordChip
          label="Longest reunion"
          value={formatDays(stats.longestTrip.meetCount)}
          detail={stats.longestTrip.tripId}
        />
        <RecordChip
          label="Busiest month"
          value={`${monthLabel(stats.busiestMonth.month)} ${stats.busiestMonth.year}`}
          detail={formatDays(stats.busiestMonth.count)}
        />
        <RecordChip
          label="Peak year"
          value={String(stats.peakYear.year)}
          detail={`${formatDays(stats.peakYear.meetDays)} · ${stats.peakYear.tripCount} trips`}
        />
      </div>
      <ol className="mt-6 space-y-5 border-l border-rose-200 pl-6">
        {stats.milestones.map((milestone) => (
          <MilestoneItem key={milestone.id} milestone={milestone} />
        ))}
      </ol>
    </section>
  )
}

function RecordChip({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl bg-rose-50 px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-rose-700 uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500">{detail}</p>
    </div>
  )
}

function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const Icon = kindIcon[milestone.kind]
  return (
    <li className="relative">
      <span className="absolute top-1 -left-[1.95rem] flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-600 ring-2 ring-rose-200">
        <Icon size={12} aria-hidden="true" />
      </span>
      <p className="text-xs font-medium tracking-wide text-rose-600 uppercase">
        {formatMeetDate(milestone.date)}
      </p>
      <p className="font-semibold text-stone-900">{milestone.title}</p>
      <p className="text-sm text-stone-500">{milestone.detail}</p>
    </li>
  )
}
