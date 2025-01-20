import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useEffect, useState} from 'react'

/**
 *
 * This was originally designed a bit as a shim for useDeferredValue, but
 * as that hook can't configure a timeout, and this one can they serve
 * somewhat different purposes, and we may want to keep this one around
 *
 * {@link https://github.com/facebook/react/blob/4729ff6d1f191902897927ff4ecd3d1f390177fa/packages/react-reconciler/src/ReactFiberHooks.new.js#L1927-L1967}
 *
 * Uses a value, but only after a timeout has passed since the last value change
 */
export function useValueDelayedByTimeout<T>(
  value: T,
  {
    /**
     * An optional timeout to wait for a value
     * to be applied. Defaults to 225ms
     *
     * This hook is not re-evaluated when this value changes,
     * but instead will apply that change on the next value change
     */
    timeoutMs = 225,
  } = {},
) {
  const [deferredValue, setDeferredValue] = useState(value)

  /**
   * Store the configurable timeout in a ref, so as to not trigger
   * the timeout when it changes, but instead only wait for the next
   * value change to use the new timeout
   */
  const timeoutMsRef = useTrackingRef(timeoutMs)

  /**
   * When the value changes, set a timeout to apply
   * the value change to the deferred state. If the
   * value changes again in that time, clear the timer
   *
   * track when mounted to avoid memeory leaks from
   * calling setState on an uunmounted component
   */
  useEffect(() => {
    let mounted = true
    const timer = setTimeout(() => {
      if (mounted) {
        setDeferredValue(value)
      }
    }, timeoutMsRef.current)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [value, timeoutMsRef])

  return deferredValue
}
