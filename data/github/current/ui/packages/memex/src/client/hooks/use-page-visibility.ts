import {useSyncExternalStore} from 'react'

function subscribe(notify: () => void) {
  document.addEventListener('visibilitychange', notify)
  return () => {
    document.removeEventListener('visibilitychange', notify)
  }
}

function getSnapshot() {
  return !document.hidden
}

function getServerSnapshot() {
  return true
}

export const usePageVisibility = (): boolean => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
