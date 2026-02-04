import { useState, useCallback, useEffect, useMemo } from 'react'
import { theme } from 'antd'

export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme:dark)').matches
  })

  const darkModeChange = useCallback((event: MediaQueryListEvent) => {
    setDarkMode(event.matches)
  }, [])

  useEffect(() => {
    if (!window) return
    const windowQuery = window.matchMedia('(prefers-color-scheme:dark)')
    windowQuery.addEventListener('change', darkModeChange)
    return () => {
      windowQuery.removeEventListener('change', darkModeChange)
    }
  }, [darkModeChange])

  const appTheme = useMemo(
    () => ({
      algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#615cf2',
        borderRadius: 12,
        sizeStep: 4,
        sizeUnit: 4,
        fontSize: 15,
        fontFamily: 'var(--font-geist-sans)',
        fontFamilyCode: 'var(--font-geist-mono)'
      }
    }),
    [darkMode]
  )

  return { theme: appTheme, darkMode }
}
