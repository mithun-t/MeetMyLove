import { useMemo, useState } from 'react'
import {
  BookHeart,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Heart,
  Quote,
  Sparkles,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { ComputedStats, TripRow } from '../../types/reunion.ts'

interface Chapter {
  year: number
  title: string
  subtitle: string
  meetDays: number
  tripCount: number
  narrative: string
  highlight: string
}

export function LoveStoryPanel({
  stats,
  rows,
}: {
  stats: ComputedStats
  rows: TripRow[]
}) {
  const [activeTab, setActiveTab] = useState<'chronicle' | 'chapters'>('chronicle')
  const [selectedChapterYear, setSelectedChapterYear] = useState<number>(2026)
  const [copied, setCopied] = useState(false)

  // Build chapter narratives based on annual data and trip rows
  const chapters = useMemo((): Chapter[] => {
    return stats.annual.map((ann) => {
      const yearRows = rows.filter((r) => r.year === ann.year)
      const yearMultiDays = yearRows.filter((r) => r.isMultiDayMeeting).length
      const longestInYear = yearRows.reduce((max, r) => (r.spanDays > max ? r.spanDays : max), 0)

      let title = `The Year of ${ann.year}`
      let subtitle = 'A Chapter in Our Journey'
      let narrative = ''
      let highlight = ''

      if (ann.year === 2021) {
        title = 'Chapter 1: The Spark of Destiny'
        subtitle = 'Where It All Began'
        narrative =
          'In late October 2021, the first chapter of our love story began. What started with our very first reunion set in motion a bond that would span years, distance, and seasons. Though just one meeting closed out 2021, it was the foundation that promised a lifetime of togetherness.'
        highlight = `First meet on ${stats.firstDate ? format(parseISO(stats.firstDate), 'MMMM d, yyyy') : 'October 30, 2021'}`
      } else if (ann.year === 2022) {
        title = 'Chapter 2: Finding Our Rhythm'
        subtitle = 'A Year of Frequent Reunions'
        narrative = `2022 was the year distance met its match. We came together ${ann.tripCount} separate times across the seasons, spending ${ann.meetDays} cherished days in each other's embrace. Every reunion reinforced that no matter how brief the trip, every shared second mattered.`
        highlight = `${ann.tripCount} reunions • ${ann.meetDays} days together`
      } else if (ann.year === 2023) {
        title = 'Chapter 3: Deepening Connections'
        subtitle = 'Consistency & Growing Closer'
        narrative = `With ${ann.tripCount} meets in 2023, our rhythm became stronger and more effortless. We shared ${ann.meetDays} days together, celebrating ${yearMultiDays} multi-day getaways and proving that our time together was only growing richer and more meaningful.`
        highlight = `${yearMultiDays} multi-day journeys • ${longestInYear} days longest trip`
      } else if (ann.year === 2024) {
        title = 'Chapter 4: The Century of Memories'
        subtitle = 'Surpassing 100 Cumulative Days'
        narrative = `2024 proved our devotion knows no bounds. Across ${ann.tripCount} meets and ${ann.meetDays} days together, we crossed monumental milestones, created countless unforgettable memories, and wove our lives ever closer through winter warmth and summer sunsets.`
        highlight = `${ann.meetDays} days together across all 4 seasons`
      } else if (ann.year === 2025) {
        title = 'Chapter 5: Unwavering Devotion'
        subtitle = 'Longer Stays & Stronger Bonds'
        narrative = `In 2025, our reunions evolved into deeper, longer stays. We gathered for ${ann.tripCount} trips and totaled ${ann.meetDays} days together. With trips stretching up to ${longestInYear} days, every goodbye grew shorter in feeling, knowing the next hello was right around the corner.`
        highlight = `${ann.meetDays} days shared • Peak getaway of ${longestInYear} continuous days`
      } else if (ann.year === 2026) {
        title = 'Chapter 6: The Golden Era'
        subtitle = 'Our Most Abundant Year'
        narrative = `2026 stands as our crowning chapter. Surpassing all prior records, we achieved an astonishing ${ann.meetDays} days together over ${ann.tripCount} trips. Our love grew deeper than ever, creating our most abundant year of companionship and joy.`
        highlight = `Record ${ann.meetDays} days together (${ann.tripCount} meets) 🏆`
      } else {
        title = `Chapter: The Story Continues (${ann.year})`
        subtitle = 'Ever-Growing Affection'
        narrative = `In ${ann.year}, our bond continued to flourish with ${ann.tripCount} meets totaling ${ann.meetDays} days of memories.`
        highlight = `${ann.tripCount} meets • ${ann.meetDays} days`
      }

      return {
        year: ann.year,
        title,
        subtitle,
        meetDays: ann.meetDays,
        tripCount: ann.tripCount,
        narrative,
        highlight,
      }
    })
  }, [stats.annual, stats.firstDate, rows])

  // Full unified narrative prose
  const fullChronicle = useMemo(() => {
    const firstFormatted = stats.firstDate
      ? format(parseISO(stats.firstDate), 'MMMM d, yyyy')
      : 'October 30, 2021'
    const peak = stats.peakYear
    const multiShare = Math.round(stats.multiDayShare * 100)

    return `From a single unforgettable day on ${firstFormatted}, our story began its beautiful ascent. What started as precious moments across distance blossomed into an enduring bond spanning ${stats.totalTrips} reunions and ${stats.totalMeetDays} days together in each other's embrace.\n\nThroughout the journey, we built a rhythm of connection—meeting on average every ${stats.averageGapDays.toFixed(0)} days. ${multiShare}% of all our trips were multi-day adventures, with our longest getaway stretching ${stats.longestTrip.spanDays} unforgettable days.\n\nOur journey reached radiant heights in ${peak.year}, our crowning year with ${peak.meetDays} days spent together across ${peak.tripCount} trips. Through every season, every calendar page, and every countdown between hellos, our story remains living proof that love doesn't just measure the distance—it closes it completely.`
  }, [stats])

  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(fullChronicle)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Ignore clipboard fallback
    }
  }

  const activeChapter = useMemo(() => {
    return chapters.find((c) => c.year === selectedChapterYear) ?? chapters[chapters.length - 1]
  }, [chapters, selectedChapterYear])

  return (
    <section className="w-full min-w-0 rounded-2xl border border-rose-200/90 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-200 dark:shadow-none">
            <BookHeart size={22} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Our Love Story Chronicle
              </h2>
              <span className="hidden items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 sm:inline-flex">
                <Sparkles size={11} /> Auto-Narrated Journey
              </span>
            </div>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              The living chronicle of our reunions, memories, and milestones written through our data
            </p>
          </div>
        </div>

        {/* Tab Controls & Copy Button */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
            <button
              type="button"
              onClick={() => setActiveTab('chronicle')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'chronicle'
                  ? 'bg-white text-stone-900 shadow-2xs dark:bg-stone-700 dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              The Full Chronicle
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chapters')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'chapters'
                  ? 'bg-white text-stone-900 shadow-2xs dark:bg-stone-700 dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Chapter by Chapter
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyStory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-750 cursor-pointer"
            title="Copy narrative to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chronicle' ? (
        <div className="mt-5 relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/40 via-stone-50/30 to-amber-50/20 p-5 sm:p-7 dark:border-stone-800 dark:from-stone-900/90 dark:via-stone-900/60 dark:to-stone-950">
          <Quote
            size={44}
            className="absolute -top-1 -left-1 text-rose-200/50 dark:text-rose-900/30 select-none pointer-events-none"
          />

          <div className="relative space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed font-serif text-sm sm:text-base">
            {fullChronicle.split('\n\n').map((paragraph, index) => (
              <p key={index} className="indent-2 sm:indent-4 first:indent-0">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-rose-200/50 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400 font-sans">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <Heart size={12} className="fill-rose-500" /> {stats.totalMeetDays} Days of Love
              </span>
              <span>•</span>
              <span>{stats.totalTrips} Reunions</span>
              <span>•</span>
              <span>{stats.annual.length} Years Documented</span>
            </div>
            <div className="text-[11px] italic">
              Written from our real journey & statistical history
            </div>
          </div>
        </div>
      ) : (
        /* Chapter by Chapter Tab */
        <div className="mt-5 space-y-4">
          {/* Chapter Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {chapters.map((chap) => (
              <button
                key={chap.year}
                type="button"
                onClick={() => setSelectedChapterYear(chap.year)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedChapterYear === chap.year
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-750'
                }`}
              >
                <span>{chap.year}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    selectedChapterYear === chap.year
                      ? 'bg-rose-700/80 text-rose-100'
                      : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                  }`}
                >
                  {chap.meetDays}d
                </span>
              </button>
            ))}
          </div>

          {/* Active Chapter Details */}
          {activeChapter && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-850/60 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      {activeChapter.subtitle}
                    </span>
                    <span className="text-xs text-stone-500">•</span>
                    <span className="text-xs font-medium text-stone-500">
                      Year {activeChapter.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">
                    {activeChapter.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 sm:self-auto">
                  <Sparkles size={13} />
                  <span>{activeChapter.highlight}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-stone-200/80 pt-4 dark:border-stone-800">
                <p className="font-serif text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
                  {activeChapter.narrative}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                  <Calendar size={13} className="text-rose-500" />
                  {activeChapter.tripCount} Trips Completed
                </span>
                <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                  <Heart size={13} className="text-pink-500" />
                  {activeChapter.meetDays} Total Days Together
                </span>
                <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                  <ChevronRight size={13} className="text-amber-500" />
                  {(activeChapter.meetDays / Math.max(1, activeChapter.tripCount)).toFixed(1)} avg days per meet
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
