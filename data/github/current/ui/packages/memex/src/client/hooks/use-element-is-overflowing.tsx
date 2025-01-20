import {useSyncExternalStore} from 'react'

/**
 *
 * Given an React.RefObject<HtmlElement>, perform an effect
 * on that checks to see whether the element is overflowing or not,
 * and execute a callback with the result of that check (and the element itself).
 *
 * @param elementRef A RefObject to any HTMLElement
 * @param perform A callback to execute in an effect that runs _on every render_ with the current element and whether it's overflowing. Returning a cleanup function can be returned from this callback to run in the effect's cleanup
 */
export function useElementIsOverflowing<T extends HTMLElement>(elementRef: React.RefObject<T>) {
  return useSyncExternalStore(subscribe, () => checkOverflow(elementRef.current))
}

function subscribe(notify: () => void) {
  const resizeObserver = new ResizeObserver(notify)
  resizeObserver.observe(document.documentElement)
  return () => {
    resizeObserver.unobserve(document.documentElement)
    resizeObserver.disconnect()
  }
}

function checkOverflow<T extends HTMLElement>(element: T | null) {
  if (!element) return false
  const curOverflow = element.style.overflow
  if (!curOverflow || curOverflow === 'visible') element.style.overflow = 'hidden'
  const isOverflowing = element.offsetWidth < element.scrollWidth
  element.style.overflow = curOverflow
  return isOverflowing
}
