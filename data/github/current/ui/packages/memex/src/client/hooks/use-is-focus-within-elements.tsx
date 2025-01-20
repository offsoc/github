import {useSyncExternalStore} from 'react'

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

export const useIsFocusWithinElements = <T extends {contains: (other: Node | null) => boolean}>(
  refs: ReadonlyArray<React.RefObject<T>>,
) => {
  return useSyncExternalStore(subscribe, () => {
    return refs.length > 0 && refs.some(ref => ref.current?.contains(document.activeElement))
  })
}
