import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useCallback, useEffect, useMemo, useRef} from 'react'

export interface Cancellable {
  /**
   * Non mutable and doesn't care about the `this` context, so it's safe to return from a
   * `useEffect` callback as `timer.cancel` (instead of `() => timer.cancel()`).
   */
  readonly cancel: (this: void) => void
}

/**
 * Same as `useSetTimeout`, but provides a stable identifier bound to a specific timout delay.
 * If the delay changes, pending timeouts will **not** be cancelled.
 */
export const useTimeout = <Args extends Array<unknown>>(fn: (...args: Args) => void, delayMs: number) => {
  const fnWithTimeout = useSetTimeout(fn)
  return useMemo(() => fnWithTimeout(delayMs), [fnWithTimeout, delayMs])
}

/**
 * Returns a function that will call the given callback after a specified delay. Ensures
 * that the function called will always be the latest version and that any pending calls
 * are cancelled when the component is unmounted.
 *
 * @example
 * const myFn = (value: string) => console.log(value)
 *
 * const myFnWithTimeout = useSetTimeout(myFn)
 *
 * // Because the result of useSetTimeout is stable, this is safe, but `myFnAfter1Second` will not be stable
 * const myFnAfter1Second = myFnWithTimeout(1000)
 *
 * // In some other place:
 * const timer = myFnAfter1Second("hello world")
 *
 * // You can cancel a pending timeout if you want:
 * timer.cancel()
 */
export const useSetTimeout = <Args extends Array<unknown>>(fn: (...args: Args) => void) => {
  const timeoutsRef = useRef<Array<Cancellable>>([])

  useEffect(
    () => () => {
      for (const timeout of timeoutsRef.current) timeout.cancel()
    },
    [],
  )

  const fnRef = useTrackingRef(fn)

  return useCallback(
    (delayMs: number) =>
      (...args: Args) => {
        const id = setTimeout(() => fnRef.current(...args), delayMs)

        const cancellable = {
          cancel: () => clearTimeout(id),
        }

        timeoutsRef.current.push(cancellable)
        return cancellable
      },
    [fnRef],
  )
}
