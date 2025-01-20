import {useCallback, useEffect, useRef} from 'react'

/**
 * Given an async callback function, cache the results until the function reference changes.
 * IMPORTANT: The function must be wrapped with `useCallback`.
 */
export function useCachedRequest<T>(request: () => Promise<T>) {
  const promise = useRef<Promise<T> | undefined>(undefined)

  useEffect(() => {
    // reset cached promises when any subject data changes
    if (promise.current) promise.current = undefined
  }, [request])

  return useCallback(() => {
    if (!promise.current) {
      promise.current = request()
    }

    return promise.current
  }, [request])
}
