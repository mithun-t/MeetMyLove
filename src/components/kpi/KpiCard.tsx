import type { LucideIcon } from 'lucide-react'

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
        <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">{value}</p>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{hint}</p>
    </article>
  )
}
