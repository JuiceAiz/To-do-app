import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'todo-app.theme'

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // fall through to system preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Ignore persistence failures.
    }
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    [],
  )

  return { theme, toggleTheme }
}
