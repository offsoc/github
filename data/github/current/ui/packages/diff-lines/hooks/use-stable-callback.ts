import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useCallback, useRef} from 'react'

/**
 * This hooks allows us to avoid losing a callback reference on component re-renders by returning a function that is referentially constant (it can never be outdated).
 *
 * The hook will also remove the hook function reference on unmount.
 *
 * This hook is preferred over `useSafeAsyncCallback` when the callback is not async and you need the function reference to be available on first mount.
 *
 * @param fn the function to call
 */

export const useStableCallback = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R | undefined) => {
  const trackingRef = useRef<((...args: A) => R) | null>(fn)
  useLayoutEffect((): (() => void) => {
    trackingRef.current = fn
    return () => (trackingRef.current = null)
  }, [fn])

  return useCallback((...args: A) => trackingRef.current?.(...args), [])
}
