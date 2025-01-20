import {useCallback, useRef, useSyncExternalStore} from 'react'

interface ElementWidth {
  offsetWidth?: number
  clientWidth?: number
}

const getElementWidth = ({offsetWidth, clientWidth}: HTMLElement): ElementWidth => ({
  offsetWidth,
  clientWidth,
})

function getSeverSnapshot() {
  return {offsetWidth: 1280, clientWidth: 1280}
}

export function useElementWidth(element: HTMLElement | null): ElementWidth {
  const sizesCache = useRef<ElementWidth>({})

  const subscribeToResize = useCallback(
    (notify: () => void) => {
      if (!element) return () => undefined
      const observer = new ResizeObserver(notify)
      observer.observe(element)
      return () => {
        observer.unobserve(element)
        observer.disconnect()
      }
    },
    [element],
  )

  const getClientSnaphsot = useCallback(() => {
    if (!element) return sizesCache.current
    const newSizes = getElementWidth(element)
    if (isEqual(newSizes, sizesCache.current)) return sizesCache.current
    sizesCache.current = newSizes
    return newSizes
  }, [element])

  return useSyncExternalStore(subscribeToResize, getClientSnaphsot, getSeverSnapshot)
}

function isEqual(lhs: ElementWidth, rhs: ElementWidth): boolean {
  return lhs.offsetWidth === rhs.offsetWidth && lhs.clientWidth === rhs.clientWidth
}
