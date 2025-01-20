import {useCallback, useSyncExternalStore} from 'react'

import {useLazyRef} from './common/use-lazy-ref'

/**
 * A specialized hook for monitoring when the command palette is shown to
 * the user, so the application can temporarily hide parts of it's UI.
 */
export const useIsCommandPaletteVisible = () => {
  const commandPaletteElementRef = useLazyRef<HTMLElement | null>(() => {
    const el = document.querySelector<HTMLElement>('command-palette')
    return el && el.closest('details')
  })

  const subscribe = useCallback(
    (notify: () => void) => {
      if (!commandPaletteElementRef.current) return () => undefined
      const observer = new MutationObserver(notify)
      observer.observe(commandPaletteElementRef.current, {
        attributes: true,
      })
      return () => {
        observer.disconnect()
      }
    },
    [commandPaletteElementRef],
  )

  const getSnapshot = useCallback(() => {
    const commandPaletteEl = commandPaletteElementRef.current
    return Boolean(commandPaletteEl && commandPaletteEl.hasAttribute('open'))
  }, [commandPaletteElementRef])

  const isCommandPaletteVisible = useSyncExternalStore(subscribe, getSnapshot)

  return {isCommandPaletteVisible}
}
