import {useTrackingRef} from '@github-ui/use-tracking-ref'
import debounce, {type DebouncedFunc, type DebounceSettings} from 'lodash-es/debounce'
import {useEffect, useMemo} from 'react'

export interface DebounceHookChangeSettings {
  /**
   * When the parameters (ie, the wait duration or any settings) are changed or the hook
   * is unmounted, any pending trailing calls must be handled to avoid potential memory
   * leaks. This parameter controls the handling strategy. This only has effect if
   * `trailing` is `true`.
   *
   * Options are:
   *
   * - `flush` (default): Call pending calls immediately. May result in occasionally calling
   *   more often than expected. This is the safest way to avoid losing data. If the callback
   *   is async, care must be taken not to set state or perform other actions if not mounted
   *   after awaiting.
   * - `cancel`: Cancel pending calls. May result in dropping calls.
   */
  onChangeBehavior?: 'flush' | 'cancel'
}

export type UseDebounceSettings = DebounceSettings & DebounceHookChangeSettings

/**
 * Get a debounced version of the provided function. A debounced function will wait to be
 * called until `waitMs` milliseconds have passed since the last invocation. The result of
 * this hook is referentially stable with respect to `fn`, but will change if the other
 * parameters change.
 *
 * @see {@link debounce Lodash's debounce docs} for more details on available options.
 */
export const useDebounce = <Fn extends (...args: never[]) => unknown>(
  fn: Fn,
  waitMs: number,
  {leading = false, maxWait, trailing = true, onChangeBehavior = 'flush'}: UseDebounceSettings = {},
): DebouncedFunc<Fn> => {
  const fnRef = useTrackingRef(fn)

  const debouncedFn = useMemo(() => {
    // It's not enough to set `maxWait` to `undefined` in the options object - it needs to not be `in`
    // the object at all. See: https://github.com/lodash/lodash/issues/5495
    // For `leading` and `trailing` we default to the default boolean values so they are fine.
    const options = maxWait === undefined ? {leading, trailing} : {leading, trailing, maxWait}

    return debounce((...args: Parameters<typeof fnRef.current>) => fnRef.current(...args), waitMs, options)
  }, [fnRef, waitMs, leading, maxWait, trailing])

  useEffect(
    () => () => {
      debouncedFn?.[onChangeBehavior]()
    },
    [debouncedFn, onChangeBehavior],
  )

  return debouncedFn
}
