import {useLayoutEffect} from '@github-ui/use-layout-effect'
import type {RefObject} from 'react'
import {useCallback, useRef, useState} from 'react'
import type {Options} from 'react-virtual'
import {useVirtual} from 'react-virtual'

export type Virtualizer = ReturnType<typeof useVirtual>

/*
The source of this hook is the PR below. It does not seem likely that it will be
upstreamed into the version of react-virtual we are using, but we might be able
to eventually get rid of this if we upgrade to the newest version of the library.

And even if not, the code is small and simple enough that it should be a small
maintenance burden.

https://github.com/TanStack/virtual/pull/210/files#diff-bfe9874d239014961b1ae4e89875a6155667db834a410aaaa2ebe3cf89820556
 */

interface VirtualWindowOptions<T extends HTMLElement> extends Options<T> {
  /**
   * Additional number to offset by when scrolling to items in the list. Useful to account for sticky
   * content.
   */
  additionalScrollOffset?: number
  useVirtualImpl?: typeof useVirtual
  // measureSize is used by react-virtual but not present in the typings for Options for some reason
  measureSize?: (element: HTMLElement) => number
}

/**
 * A hook that wraps the `useVirtual` hook and provides virtualization when the scroll container is the window. This
 * requires some additional logic since window is technically not an HTMLElement.
 */
export function useVirtualWindow<T extends HTMLElement = HTMLElement>({
  additionalScrollOffset = 0,
  scrollToFn,
  horizontal,
  parentRef,
  useVirtualImpl = useVirtual,
  ...rest
}: VirtualWindowOptions<T>): Virtualizer {
  const windowRef = useRef(window)
  const scrollOffsetFn = useCallback(() => {
    const bounds = parentRef.current?.getBoundingClientRect()
    const top = bounds?.top ?? 0
    const left = bounds?.left ?? 0
    return horizontal ? left * -1 : top * -1
  }, [horizontal, parentRef])

  const defaultScrollToFn = useCallback(
    (offset: number) => {
      const parentOffsetTop = (parentRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY
      const scrollOffset = offset + parentOffsetTop + additionalScrollOffset
      windowRef.current?.scroll({top: horizontal ? 0 : scrollOffset, left: horizontal ? scrollOffset : 0})
    },
    [additionalScrollOffset, horizontal, parentRef],
  )

  return useVirtualImpl({
    ...rest,
    horizontal,
    parentRef,
    scrollToFn: scrollToFn || defaultScrollToFn,
    onScrollElement: windowRef as unknown as RefObject<HTMLElement>,
    scrollOffsetFn,
    useObserver: () => useWindowRect(windowRef),
  })
}

function useWindowRect(windowRef: RefObject<Window>) {
  const [rect, setRect] = useState({height: 0, width: 0})
  const element = windowRef.current
  useLayoutEffect(() => {
    if (!element) return
    const resizeHandler = () => {
      const next = {
        height: element.innerHeight,
        width: element.innerWidth,
      }
      setRect(prev => (prev.height !== next.height || prev.width !== next.width ? next : prev))
    }

    resizeHandler()

    // eslint-disable-next-line github/prefer-observers
    element.addEventListener('resize', resizeHandler)
    return () => {
      element.removeEventListener('resize', resizeHandler)
    }
  }, [element])

  return rect
}
