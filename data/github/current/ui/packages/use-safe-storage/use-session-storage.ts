import safeStorage from '@github-ui/safe-storage'
import {useCallback, useEffect, useState, type Dispatch, useRef} from 'react'

const safeSessionStorage = safeStorage('sessionStorage')

const USE_SESSION_STORAGE_UPDATE_EVENT_NAME = 'session-storage-update'

class UseSessionStorageUpdateEvent extends Event {
  declare storageKey: string
  declare storageValue: unknown | undefined

  constructor(storageKey: string, storageValue: unknown | undefined) {
    super(USE_SESSION_STORAGE_UPDATE_EVENT_NAME)
    this.storageKey = storageKey
    this.storageValue = storageValue
  }
}

declare global {
  interface Document {
    addEventListener(
      type: typeof USE_SESSION_STORAGE_UPDATE_EVENT_NAME,
      listener: (this: Document, ev: UseSessionStorageUpdateEvent) => void,
    ): void
    removeEventListener(
      type: typeof USE_SESSION_STORAGE_UPDATE_EVENT_NAME,
      listener: (this: Document, ev: UseSessionStorageUpdateEvent) => void,
    ): void
  }
}

/**
 * A hook that mirrors state to session storage
 *
 * The fallback state is _not_ written to session storage, so tearing can occur
 * whenever sessionStorage is empty, if different fallback values are used
 * for the same key, however once a value is updated, other consumers
 * of the same storage keys will update
 */
export function useSessionStorage<T>(storageKey: string, fallbackState: T): readonly [T, Dispatch<T | undefined>] {
  // copy fallbackState to a tracked ref, to avoid re-renders if it has unstable identity
  const fallbackStateRef = useRef(fallbackState)
  useEffect(() => {
    fallbackStateRef.current = fallbackState
  })

  const [value, setValue] = useState<T>(() => {
    const itemValue = safeSessionStorage.getItem(storageKey)
    if (itemValue) {
      return JSON.parse(itemValue)
    }
    return fallbackStateRef.current
  })

  const setNextValue: Dispatch<T | undefined> = useCallback(
    nextValue => {
      setValue(nextValue ?? fallbackStateRef.current)

      if (nextValue === undefined) {
        safeSessionStorage.removeItem(storageKey)
      } else {
        safeSessionStorage.setItem(storageKey, JSON.stringify(nextValue))
      }

      document.dispatchEvent(new UseSessionStorageUpdateEvent(storageKey, nextValue))
    },
    [storageKey],
  )

  /**
   * When we change the value, we emit an event
   *
   * Subscribe to that event, so we can continuously sync
   * the state
   */
  useEffect(() => {
    function handler(event: UseSessionStorageUpdateEvent) {
      if (event.storageKey === storageKey) {
        const nextValue: T = (event.storageValue as T | undefined) ?? fallbackStateRef.current
        setValue(nextValue)
      }
    }

    document.addEventListener(USE_SESSION_STORAGE_UPDATE_EVENT_NAME, handler)

    /**
     * during setup, it's _possible_ we've diverged, so we'll
     * immediately check for an update
     *
     * This also provides a 'reset' in the event the storageKey was changed
     */
    const itemValue = safeSessionStorage.getItem(storageKey)
    if (itemValue) {
      setValue(JSON.parse(itemValue))
    } else {
      setValue(fallbackStateRef.current)
    }

    return () => {
      document.removeEventListener(USE_SESSION_STORAGE_UPDATE_EVENT_NAME, handler)
    }
  }, [storageKey])

  return [value, setNextValue] as const
}

export function clearSessionStorage(storageKeys: string[]) {
  for (const storageKey of storageKeys) {
    safeSessionStorage.removeItem(storageKey)
    document.dispatchEvent(new UseSessionStorageUpdateEvent(storageKey, undefined))
  }
}
