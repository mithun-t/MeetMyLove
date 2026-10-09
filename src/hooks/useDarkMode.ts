import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('meetmylove-theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('meetmylove-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('meetmylove-theme', 'light')
    }
  }, [isDark])

  const toggleDark = () => {
    setIsDark((prev) => !prev)
  }

  return { isDark, toggleDark }
}
