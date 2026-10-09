import { useEffect, useState } from 'react'
import {
  BarChart3,
  BookHeart,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Plus,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'story', label: 'Story', icon: BookHeart },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'log', label: 'Log', icon: FileText },
]

export function BottomNav({
  onAddClick,
}: {
  onAddClick?: () => void
}) {
  const [activeId, setActiveId] = useState<string>('overview')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180
      for (const item of [...NAV_ITEMS].reverse()) {
        const element = document.getElementById(item.id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(item.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setActiveId(id)
    const element = document.getElementById(id)
    if (element) {
      const offset = 70 // header height
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 block md:hidden border-t border-stone-200/80 bg-white/90 pb- safe backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90 no-print"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeId === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
                  isActive ? 'scale-110 bg-rose-50 dark:bg-rose-950/60' : ''
                }`}
              >
                <Icon size={17} />
              </div>
              <span className="mt-0.5">{item.label}</span>
            </button>
          )
        })}

        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="flex flex-col items-center justify-center rounded-xl px-2 py-1 text-[10px] font-medium text-rose-600 transition-transform active:scale-90 cursor-pointer"
            title="Add Meet"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs">
              <Plus size={16} />
            </div>
            <span className="mt-0.5 text-stone-600 dark:text-stone-300 font-semibold">New</span>
          </button>
        )}
      </div>
    </nav>
  )
}
