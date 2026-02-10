import { useEffect, useCallback } from 'react'

export function useEscapeKey(onEscape: () => void, enabled: boolean = true, condition: boolean = true) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && condition) {
        event.preventDefault()
        event.stopPropagation()
        onEscape()
      }
    },
    [onEscape, condition]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleEscape, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleEscape, { capture: true })
    }
  }, [enabled, handleEscape])
}
