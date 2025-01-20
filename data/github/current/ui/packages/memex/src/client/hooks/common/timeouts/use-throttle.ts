import type {DebounceHookChangeSettings} from '@github-ui/use-debounce'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import type {DebouncedFunc} from 'lodash-es/debounce'
import throttle, {type ThrottleSettings} from 'lodash-es/throttle'
import {useEffect, useMemo} from 'react'

export type UseThrottleSettings = ThrottleSettings & DebounceHookChangeSettings

/**
 * Get a throttled version of the provided function. A throttled function cannot be called
 * more often than every `waitMs` milliseconds. The result of this hook is referentially
 * stable with respect to `fn`, but will change if the other parameters change.
 *
 * @see {@link throttle Lodash's throttle docs} for more details on available options.
 */
export const useThrottle = <Fn extends (...args: Array<any>) => unknown>(
  fn: Fn,
  waitMs: number,
  // It's important to fall back to booleans rather than passing `undefined` to the function
  // because otherwise they will default to `false`: https://github.com/lodash/lodash/issues/5495
  {leading = true, trailing = true, onChangeBehavior = 'flush'}: UseThrottleSettings = {},
): DebouncedFunc<Fn> => {
  const fnRef = useTrackingRef(fn)

  const throttledFn = useMemo(
    () => throttle((...args: Parameters<typeof fnRef.current>) => fnRef.current(...args), waitMs, {leading, trailing}),
    [fnRef, waitMs, leading, trailing],
  )

  useEffect(
    () => () => {
      throttledFn?.[onChangeBehavior]()
    },
    [throttledFn, onChangeBehavior],
  )

  return throttledFn
}
