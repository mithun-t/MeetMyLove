import type { ReactNode } from 'react'

export function ChartCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string
  subtitle: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      <h2 className="text-base font-semibold text-stone-900">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}
