import {useRef} from 'react'

const UNSET = Symbol('UNSET')
/**
 *
 * A hook that returns a ref to a value that is only evaluated once
 * on initial render, avoiding the need to re-evaluate the value
 * when it will be thrown out
 *
 * @param init A function that returns the initial value of the ref.
 * @returns
 */
export function useLazyRef<T>(init: () => T): React.MutableRefObject<T> {
  /**
   * Casting this looks odd, but since we immediately set it after, and
   * only set it once, it's ok
   */
  const ref = useRef(UNSET as T)
  if (ref.current === UNSET) {
    ref.current = init()
  }

  return ref
}
