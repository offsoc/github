import {useEffect} from 'react'

import {FilterBarShortcut, shortcutFromEvent} from '../../helpers/keyboard-shortcuts'

export function useHandleFilterBarShortcut(onFilterBarShortcut: () => void) {
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const eventShortcut = shortcutFromEvent(e)

      if (eventShortcut === FilterBarShortcut) {
        if (e.defaultPrevented) return
        e.stopPropagation()
        e.preventDefault()
        onFilterBarShortcut()
      }
    }
    addEventListener('keydown', onKeydown)

    return () => removeEventListener('keydown', onKeydown)
  }, [onFilterBarShortcut])
}
