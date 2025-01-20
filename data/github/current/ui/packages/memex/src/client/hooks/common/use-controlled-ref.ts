import {type MutableRefObject, useCallback, useState} from 'react'

/**
 * React useRef hook doesn't allow rerendering if reference has changed.
 * Use this hook to avoid this problem.
 *
 * @type T - type of the reference
 */
export function useControlledRef<T>() {
  const [ref, setRef] = useState<MutableRefObject<T | null>>({current: null})

  const onRefChange = useCallback(
    (next: T | null) => {
      if (ref.current !== next) {
        setRef({current: next})
      }
    },
    [ref],
  )

  return [ref, onRefChange] as const
}
