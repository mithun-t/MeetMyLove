import type { ReactNode } from 'react'
import { Heart } from 'lucide-react'

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-stone-50 text-stone-800">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
          <span className="rounded-2xl bg-rose-50 p-2.5 text-rose-600">
            <Heart size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-rose-600 uppercase">
              2021 – 2026
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              Reunion Analytics
            </h1>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  )
}
