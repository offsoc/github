import {useSyncExternalStore} from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getClientSnapshot() {
  return navigator.onLine
}
function getServerSnapshot() {
  return true
}
export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
