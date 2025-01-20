import type {Location} from 'react-router-dom'
import {useEffect, useRef} from 'react'
import {PREVENT_AUTOFOCUS_KEY} from './prevent-autofocus'

export function useNavigationFocus(isLoading: boolean, location: Location) {
  // focus on navigations:
  const lastFocusedPath = useRef<string | undefined>(undefined)
  const state = useRef(location.state)
  useEffect(() => {
    state.current = location.state
  })
  useEffect(() => {
    // we don't want to focus when only the hash changes
    const currentPath = location.pathname + location.search
    // initially this is undefined because we don't want to focus on the initial page load
    if (lastFocusedPath.current === undefined) {
      lastFocusedPath.current = currentPath
    } else if (lastFocusedPath.current !== currentPath) {
      if (!isLoading) {
        if (!autofocusPrevented(state.current)) {
          let focusElement = document.querySelector<HTMLElement>('[data-react-autofocus]')
          if (!focusElement) {
            focusElement = document.querySelector<HTMLElement>('react-app h1')
            if (focusElement && !focusElement.hasAttribute('tabindex')) {
              focusElement.setAttribute('tabindex', '-1')
            }
          }
          focusElement?.focus()
        }

        lastFocusedPath.current = currentPath
      }
    }
  }, [isLoading, location.pathname, location.search])
}

function autofocusPrevented(state: unknown) {
  return (
    typeof state === 'object' &&
    state !== null &&
    PREVENT_AUTOFOCUS_KEY in state &&
    state[PREVENT_AUTOFOCUS_KEY] === true
  )
}
