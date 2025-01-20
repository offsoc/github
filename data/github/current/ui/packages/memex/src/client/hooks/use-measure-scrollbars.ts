import isEqual from 'lodash-es/isEqual'
import {useCallback, useRef, useSyncExternalStore} from 'react'

export function useMeasureScrollbars<E extends HTMLElement>(measureScrollbarsRef: React.RefObject<E>) {
  const cached = useRef<{
    horizontalScrollbarSize: number | null
    verticalScrollbarSize: number | null
  }>({horizontalScrollbarSize: null, verticalScrollbarSize: null})

  const subscribe = useCallback(
    (notify: () => void) => {
      const {current} = measureScrollbarsRef
      if (!current) return () => undefined
      const observer = new ResizeObserver(notify)
      observer.observe(current)
      return () => {
        observer.unobserve(current)
        observer.disconnect()
      }
    },
    [measureScrollbarsRef],
  )

  return useSyncExternalStore(subscribe, () => {
    const {current: element} = measureScrollbarsRef
    if (!element) return cached.current
    const horizontalScrollbarSize = element ? element.offsetHeight - element.clientHeight : null
    const verticalScrollbarSize = element ? element.offsetWidth - element.clientWidth : null
    const next = {horizontalScrollbarSize, verticalScrollbarSize}
    if (!isEqual(cached.current, next)) {
      cached.current = next
    }

    return cached.current
  })
}
