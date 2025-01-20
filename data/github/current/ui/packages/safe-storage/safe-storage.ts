import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {sendStats} from '@github-ui/stats'

type StorageBackend = 'sessionStorage' | 'localStorage'

/**
 * An implementation of the Storage API that throws away all data.  Used in
 * cases when the requested Storage backend is not available.
 */
class NoOpStorage {
  getItem() {
    return null
  }

  setItem() {
    return undefined
  }

  removeItem() {
    return undefined
  }

  clear() {
    return undefined
  }

  key() {
    return null
  }

  get length() {
    return 0
  }
}

type SafeStorageOptions = {
  /** Callers may opt not to suppress quota errors thrown on set in case they rely on recieving them. */
  throwQuotaErrorsOnSet: boolean
  /** The amount of time the value should remain in storage, in milliseconds */
  ttl?: number
  /** Don't send stats in CI */
  sendCacheStats?: boolean
}

/**
 * Safely access Storage items by wrapping a Storage instance
 * (localStorage or sessionStorage) with safe versions of its API
 * methods.  Callers may opt not to suppress quota errors thrown on
 * set in case they rely on recieving them.
 */
export default function safeStorage<T = string>(
  storageKey: StorageBackend,
  options: SafeStorageOptions = {throwQuotaErrorsOnSet: false},
  global = ssrSafeWindow,
  deserialize: (value: string) => T = value => value as unknown as T,
  serialize: (value: T) => string = (value: T) => value as unknown as string,
) {
  let storage: Storage
  try {
    if (!global) {
      // in an SSR environment, use noop storage
      throw new Error()
    }

    storage = global[storageKey] || new NoOpStorage()
  } catch {
    storage = new NoOpStorage()
  }

  const {throwQuotaErrorsOnSet} = options

  function emitStats(key: PlatformBrowserIncrementKey) {
    if (options.sendCacheStats) {
      sendStats({incrementKey: key})
    }
  }

  /**  Safely get storage item. Returns `null` if the item is older than the provided ttl */
  function getItem(key: string, now: number = new Date().getTime()): T | null {
    try {
      const value = storage.getItem(key)
      if (!value) {
        return null
      }
      const expiryKey = `${key}:expiry`
      const expiry = Number(storage.getItem(expiryKey))
      if (expiry && now > expiry) {
        removeItem(key)
        removeItem(expiryKey)
        emitStats('SAFE_STORAGE_VALUE_EXPIRED')
        return null
      } else {
        emitStats('SAFE_STORAGE_VALUE_WITHIN_TTL')
        return deserialize(value)
      }
    } catch (error) {
      // Ignore browser private mode error.
      return null
    }
  }

  /**
   * Safely set storage item.
   * If `ttl` is provided, set an expiry time for the item under the key `${key}:expiry`
   * This function will be called
   */
  function setItem(key: string, value: T, now: number = new Date().getTime()) {
    try {
      storage.setItem(key, serialize(value) as unknown as string)
      if (options.ttl) {
        const expiryKey = `${key}:expiry`
        const expiry = now + options.ttl
        storage.setItem(expiryKey, expiry.toString())
      }
    } catch (error) {
      if (throwQuotaErrorsOnSet && error instanceof Error && error.message.toLowerCase().includes('quota')) throw error
    }
  }

  // Safely remove storage item.
  function removeItem(key: string) {
    try {
      storage.removeItem(key)
      if (options.ttl) {
        const expiryKey = `${key}:expiry`
        storage.removeItem(expiryKey)
      }
    } catch (error) {
      // Ignore browser private mode error.
    }
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear: storage.clear,
    key: storage.key,
    get length() {
      return storage.length
    },
  }
}

export function jsonSafeStorage<T>(storageBackend: StorageBackend) {
  return safeStorage<T>(
    storageBackend,
    {throwQuotaErrorsOnSet: false},
    ssrSafeWindow,
    JSON.parse as (value: string) => T,
    JSON.stringify as (obj: T) => string,
  )
}
