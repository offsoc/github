import isEqual from 'lodash-es/isEqual'
import {useCallback, useSyncExternalStore} from 'react'

let currentPointerPosition = {x: 0, y: 0}
/**
 * A hook that calls a selector function whenever the pointer moves.
 * The selector function is called with the current pointer location.
 * The hook returns the selector function's return value.
 *
 * This hook is a wrapper around useSyncExternalStore, so object return values
 * must be memoized to avoid infinite loops
 *
 * @param selector A function that is called with the current pointer location.
 * @returns The selector function's return value.
 * @example
 * const element = useRef(...)
 * const isMouseOverElement = useOnPointerMove(({x, y}) => {
 *    if (!element.current) return false
 *    const rect = element.current.getBoundingClientRect()
 *    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
 * })
 */
export function useOnPointerMove<T>(selector: (pointerLocation: {x: number; y: number}) => T): T {
  const getSnapshot = useCallback(() => selector(currentPointerPosition), [selector])
  return useSyncExternalStore(subscribe, getSnapshot)
}

function subscribe(notify: () => void) {
  function handleMouseMove(event: MouseEvent) {
    const nextPosition = {x: event.x, y: event.y}
    if (!isEqual(nextPosition, currentPointerPosition)) {
      currentPointerPosition = {x: event.x, y: event.y}
    }
    notify()
  }
  document.addEventListener('pointermove', handleMouseMove)
  return () => document.removeEventListener('pointermove', handleMouseMove)
}
