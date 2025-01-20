import type React from 'react'
import {useCallback, useEffect, useState} from 'react'

export function useStickyObserver(elementRef: React.RefObject<HTMLDivElement>): boolean {
  const [isStickied, setIsStickied] = useState(false)
  const stickyCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // There can be multiple entries if the user scrolled down and up quickly.
      // Just respond to the last one.
      const e = entries[entries.length - 1]
      // Less than 1 means some portion of the element is scrolled out of view
      // With top: -1px we expect this to be < 1 when the element is stuck.
      const isIntersecting = e!.intersectionRatio < 1
      if (isIntersecting !== isStickied) {
        setIsStickied(isIntersecting)
      }
    },
    [isStickied, setIsStickied],
  )

  useEffect(() => {
    const element = elementRef.current
    const options = {threshold: [1], rootMargin: '-1px 0px 0px 0px'}

    const observer = new IntersectionObserver(stickyCallback, options)

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [elementRef, stickyCallback])

  return isStickied
}
