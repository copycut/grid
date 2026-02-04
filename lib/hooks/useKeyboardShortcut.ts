import { useEffect, useCallback } from 'react'

type ModifierKeys = {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  cmdOrCtrl?: boolean
}

type KeyboardShortcutConfig = {
  key: string
  modifiers?: ModifierKeys
  enabled?: boolean
  preventDefault?: boolean
}

export function useKeyboardShortcut(callback: () => void, config: KeyboardShortcutConfig) {
  const { key, modifiers = {}, enabled = true, preventDefault = true } = config

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (modifiers.cmdOrCtrl) {
        const isCmdOrCtrl = event.metaKey || event.ctrlKey
        if (!isCmdOrCtrl) return
      }

      // Check if the key matches
      if (event.key !== key) return

      if (preventDefault) {
        event.preventDefault()
      }

      callback()
    },
    [key, modifiers, preventDefault, callback]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
