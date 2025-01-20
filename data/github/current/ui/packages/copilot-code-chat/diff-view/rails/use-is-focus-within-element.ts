import {useSyncExternalStore} from 'react'

// adapted from https://github.com/github/github/blob/master/ui/packages/memex/src/client/hooks/use-is-focus-within-elements.tsx

const subscribe = (notify: () => void) => {
  window.addEventListener('focus', notify, {capture: true})
  window.addEventListener('blur', notify)
  window.addEventListener('click', notify)
  return () => {
    window.removeEventListener('focus', notify, {capture: true})
    window.removeEventListener('blur', notify)
    window.removeEventListener('click', notify)
  }
}

export const useIsFocusWithinElement = (element?: HTMLElement) => {
  return useSyncExternalStore(subscribe, () => {
    return element?.contains(document.activeElement)
  })
}
