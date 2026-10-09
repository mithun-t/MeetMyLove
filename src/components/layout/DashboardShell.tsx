import type { ReactNode } from 'react'
import { Download, Heart, Moon, Sun } from 'lucide-react'

export function DashboardShell({
  children,
  action,
  isDark,
  onToggleDark,
  onExportPdf,
}: {
  children: ReactNode
  action?: ReactNode
  isDark?: boolean
  onToggleDark?: () => void
  onExportPdf?: () => void
}) {
  return (
    <div className="min-h-svh bg-stone-50 text-stone-800 transition-colors duration-200 dark:bg-stone-950 dark:text-stone-100">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur-md transition-colors dark:border-stone-800 dark:bg-stone-900/90 no-print">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-rose-50 p-2.5 text-rose-600 shadow-2xs dark:bg-rose-950/60 dark:text-rose-400">
              <Heart size={22} className="fill-rose-500 text-rose-500" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-rose-600 uppercase dark:text-rose-400">
                2021 – 2026
              </p>
              <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-2xl">
                Meet Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {onToggleDark && (
              <button
                type="button"
                onClick={onToggleDark}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-2xs hover:bg-stone-100 transition-colors dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-750 cursor-pointer"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun size={17} className="text-amber-400" />
                ) : (
                  <Moon size={17} className="text-stone-600" />
                )}
              </button>
            )}

            {/* Print / Export PDF */}
            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-100 transition-colors dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-750 cursor-pointer"
                title="Export or print full dashboard report"
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>
            )}

            {action}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  )
}
