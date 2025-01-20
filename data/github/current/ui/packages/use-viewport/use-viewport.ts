import {useSyncExternalStore, useCallback, useRef} from 'react'

import isEqual from 'lodash-es/isEqual'

interface ViewportInformation {
  height?: number
  isLandscape?: boolean
  isTouchDevice?: boolean
  pixelDensity?: number
  width?: number
}

const getViewportInformation = (element: HTMLElement): ViewportInformation => {
  return {
    height: element.clientHeight,
    isLandscape: window.matchMedia('(orientation: landscape)').matches,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    pixelDensity: window.devicePixelRatio,
    width: element.clientWidth,
  }
}

export function useViewport(): ViewportInformation {
  const element = document.documentElement
  const viewportCache = useRef<ViewportInformation>({})

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
    const newViewport = getViewportInformation(element)
    if (isEqual(newViewport, viewportCache.current)) return viewportCache.current
    viewportCache.current = newViewport
    return newViewport
  })
}
