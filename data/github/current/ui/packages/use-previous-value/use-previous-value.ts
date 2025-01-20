import {useEffect, useRef} from 'react'

/**
 * Tracks changes to a value across render cycles and returns the value that was used in the previous render cycle.
 * Note: This hook will return undefined on the first render cycle.
 */
export function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
