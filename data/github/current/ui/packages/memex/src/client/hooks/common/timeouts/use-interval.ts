import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useCallback, useEffect, useMemo, useRef} from 'react'

import type {Cancellable} from './use-timeout'

/**
 * Same as `useSetInterval`, but provides a stable identifier bound to an interval duration.
 * When the interval changes, existing intervals won't be cancelled, but all intervals
 * generated with any interval duration will be canceled upon unmount.
 */
export const useInterval = <Args extends Array<unknown>>(fn: (...args: Args) => void, intervalMs: number) => {
  const fnWithTimeout = useSetInterval(fn)
  return useMemo(() => fnWithTimeout(intervalMs), [fnWithTimeout, intervalMs])
}

/**
 * Returns a function that will start an interval with the given interval duration. Ensures
 * that the function called will always be the latest version and that any running intervals
 * are cancelled when the component is unmounted.
 *
 * @example
 * const myFn = (value: string) => console.log(value)
 *
 * const startMyFnInterval = useSetInterval(myFn)
 *
 * // In some other place:
 * const interval = startMyFnInterval(1000)("hello world")
 *
 * // You can cancel it:
 * interval.cancel()
 */
export const useSetInterval = <Args extends Array<unknown>>(fn: (...args: Args) => void) => {
  const intervalsRef = useRef<Array<Cancellable>>([])

  useEffect(
    () => () => {
      for (const interval of intervalsRef.current) interval.cancel()
    },
    [],
  )

  const fnRef = useTrackingRef(fn)

  return useCallback(
    (intervalMs: number) =>
      (...args: Args) => {
        const id = setInterval(() => fnRef.current(...args), intervalMs)

        const cancellable = {
          cancel: () => clearInterval(id),
        }

        intervalsRef.current.push(cancellable)
        return cancellable
      },
    [fnRef],
  )
}
