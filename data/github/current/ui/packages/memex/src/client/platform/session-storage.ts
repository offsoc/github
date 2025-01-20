import {getStorageKey} from './get-storage-key'
import {safeSessionStorage} from './safe-session-storage'

/**
 * Returns the value from session storage for the given project key
 * @param key string
 * @returns the session data
 */
export function getSessionDataForKey(key: string) {
  return safeSessionStorage.getItem(getStorageKey(key))
}

/**
 * Returns the value from session storage for the given project key
 * @param key string
 * @param value the value to store in session storage, which must be a string
 * @returns the session data
 */
export function setSessionDataForKey(key: string, value: string) {
  return safeSessionStorage.setItem(getStorageKey(key), value)
}

export function clearSessionDataForKey(key: string) {
  return safeSessionStorage.removeItem(getStorageKey(key))
}
