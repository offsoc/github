import React from 'react'
import type {Options} from 'react-virtual'
import {useVirtual} from 'react-virtual'

const defaultKeyExtractor = (index: number) => index

/**
 * A hook that wraps the `useVirtual` hook and provides virtualization for lists of dynamic elements that may
 * change in size. By default, `useVirtual` assumes the size of items in the list won't change.
 */
export function useVirtualDynamic<T>(options: Options<T>) {
  const measureRefCacheRef = React.useRef<Record<string, (el: HTMLElement | null) => void>>({})
  const elCacheRef = React.useRef<Record<string, Element | null>>({})

  const update = (key: number | string, el: HTMLElement) => {
    measureRefCacheRef.current[key]!(el)
  }
  const updateRef = React.useRef(update)
  updateRef.current = update

  const resizeObserverRef = React.useRef(
    new ResizeObserver(entries => {
      for (const entry of entries) {
        const el = entry.target
        const attribute = 'data-key'
        const key = el.getAttribute(attribute)

        if (key === null) {
          throw new Error(`Value not found, for '${attribute}' attribute`)
        }

        const htmlEl = el as HTMLElement

        updateRef.current(key, htmlEl)
      }
    }),
  )

  React.useEffect(() => {
    const ro = resizeObserverRef.current
    return () => {
      ro.disconnect()
    }
  }, [])

  const {size, keyExtractor = defaultKeyExtractor} = options

  const cachedMeasureRefWrappers = React.useMemo(() => {
    // Function that returns a function that will be passed to the `measureRef` prop of virtualized items.
    // `measureRef` is the item ref that is passed to the actual item component and used to measure the item's size.
    // In this case, we utilize the `ResizeObserver` to subscribe to changes in each item's size, making the list
    // responsive to layout changes without manual intervention.
    const makeMeasureRefWrapperForItem = (key: string | number) => (el: HTMLElement | null) => {
      if (elCacheRef.current[key]) {
        resizeObserverRef.current.unobserve(elCacheRef.current[key])
      }

      if (el) {
        updateRef.current(key, el)
        resizeObserverRef.current.observe(el)
      }

      elCacheRef.current[key] = el
    }

    const measureRefsMap: Record<string, (el: HTMLElement | null) => void> = {}

    for (let i = 0; i < size; i++) {
      const key = keyExtractor(i)

      measureRefsMap[key] = makeMeasureRefWrapperForItem(key)
    }

    return measureRefsMap
  }, [size, keyExtractor])

  const rowVirtualizer = useVirtual(options)

  const virtualItems = rowVirtualizer.virtualItems.map(item => {
    measureRefCacheRef.current[item.key] = item.measureRef

    return {
      ...item,
      measureRef: cachedMeasureRefWrappers[item.key]!,
    }
  })

  return {...rowVirtualizer, virtualItems}
}
