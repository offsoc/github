import {useCallback, useState} from 'react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useIntersectionObserver} from './use-intersection-observer'

const stickyStyles: BetterSystemStyleObject = {
  position: 'sticky',
  top: '-1px',
  zIndex: 11, // Avatar component in Description has z-index of 10
  transition: 'all 0.2s ease-in-out',
  backgroundColor: 'canvas.default',
}

/**
 * Hook to use a "sensor" element to pass to IntersectionObserver
 * If the sensor has reached the top of the viewport, isSticky will be true.
 */
export function useStickyHeader(observerOptions?: IntersectionObserverInit) {
  const [hasRoots, setHasRoots] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  const opts = {
    root: null,
    rootMargin: '0px',
    threshold: [0, 1],
    ...observerOptions,
  }

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      const intersect = entry?.intersectionRatio || 0 // fallback to thinking the sensor element is out of the frame if we don't know
      setIsSticky(intersect < 1)
      setHasRoots((entry?.rootBounds?.height ?? 0) > 0 ?? false) // if rootBounds is 0, we don't have a root
    },
    [setIsSticky],
  )

  const [observe, unobserve] = useIntersectionObserver(handleIntersection, opts)

  return {isSticky, hasRoots, stickyStyles, observe, unobserve}
}
