import { useState, useCallback, useEffect } from 'react'
import { theme } from 'antd'

export function useTheme() {
  const windowQuery = window.matchMedia('(prefers-color-scheme:dark)')
  const [darkMode, setDarkMode] = useState(windowQuery.matches)
  const darkModeChange = useCallback((event: MediaQueryListEvent) => {
    setDarkMode(event.matches ? true : false)
  }, [])

  useEffect(() => {
    windowQuery.addEventListener('change', darkModeChange)
    return () => {
      windowQuery.removeEventListener('change', darkModeChange)
    }
  }, [windowQuery, darkModeChange])

  const appTheme = {
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
  }

  return { theme: appTheme, darkMode }
}
