import isEqual from 'lodash-es/isEqual'
import {useCallback, useRef, useSyncExternalStore} from 'react'

interface ElementSizes {
  offsetWidth?: number
  offsetHeight?: number
  clientWidth?: number
  clientHeight?: number
}

const getElementSizes = ({offsetWidth, offsetHeight, clientWidth, clientHeight}: HTMLElement): ElementSizes => ({
  offsetWidth,
  offsetHeight,
  clientWidth,
  clientHeight,
})

export function useElementSizes(element: HTMLElement | null): ElementSizes {
  const sizesCache = useRef<ElementSizes>({})

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

  return useSyncExternalStore(subscribeToResize, () => {
    if (!element) return sizesCache.current
    const newSizes = getElementSizes(element)
    if (isEqual(newSizes, sizesCache.current)) return sizesCache.current
    sizesCache.current = newSizes
    return newSizes
  })
}
