import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {unstable_batchedUpdates} from 'react-dom'

import {useLazyRef} from '../../../hooks/common/use-lazy-ref'

/**
 * A context and hook that allows virtualized rendering by making use of the
 * IntersectionObserver API.
 *
 *     function Parent() {
 *       <ObserverProvider>
 *         <Child />
 *       </ObserverProvider>
 *     }
 *
 *     function Child() {
 *       const ref = useRef()
 *       const {isVisible, size} = useIsVisible({ref})
 *
 *       return (
 *         <div style={{height: isVisible ? 'unset' : size}} ref={ref}>
 *           {isVisible ? <ExpensiveContent /> : null}
 *         </div>
 *       )
 *     }
 */

/**
 * Object containing utilities for entry item visibility
 */
type Entry = {
  /** A function to update the `isVisible` state on the item */
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
}

// This average size should be configurable in the provider, probably.
const ObserverContext = createContext<{
  /**
   * The observer instance
   */
  observer: IntersectionObserver | null

  /**
   * A map of HTML elements to maps describing visibility
   */
  elMapRef: React.MutableRefObject<Map<HTMLElement, Entry>>

  /**
   * A ref used to build a running average of item height
   *
   * TODO: Investigate whether this really helps or just adds unnecessary work.
   * It seems like because we set the actual size on first intersection,
   * anyway, that this may only help when the user scrolls very quickly or
   * jumps to some offset.
   */
  avgRef: React.MutableRefObject<{count: number; avg: number}>
}>({
  observer: null,
  elMapRef: {current: new Map()},
  avgRef: {current: {count: 0, avg: 0}},
})

type ObserverProviderProps = Omit<IntersectionObserverInit, 'root'> & {
  /** The ref used as the root of the intersection observer */
  rootRef: React.RefObject<HTMLElement> | null
  /**
   * The margin around the root of the intersection observer, expressed as a margin CSS attribute
   * value. This margin is added to the root to determine the effective intersection area.
   */
  rootMargin?: string
  /** The estimated height of each object. When not supplied, defaultHeight must be provided when invoking useIsVisible */
  sizeEstimate?: number
  /** Whether to disable hiding elements (hidden elements will still be made visible) */
  disableHide?: boolean
}

/**
 * Sets up the observer context, so that children may use the `useIsVisible` hook.
 */
export const ObserverProvider = memo<React.PropsWithChildren<ObserverProviderProps>>(function ObserverProvider(props) {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)
  const elMapRef = useLazyRef(() => new Map<HTMLElement, Entry>())
  const avgRef = useRef({count: 0, avg: props.sizeEstimate ?? 0})
  const propsRef = useTrackingRef(props)

  const onObserver: IntersectionObserverCallback = useCallback(
    entries => {
      // Using unstable_batchedUpdates ensures that all of our updates called from
      // the intersection observer are batched. This would be the default when use
      // blocking mode or concurrent mode.
      //
      // The hook works without this, but it seems more efficient with it.
      // Otherwise, lots of commits are generated sometimes by state changes.
      unstable_batchedUpdates(() => {
        // Set the visibility state of each entry in the intersection observer
        // callback.
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          const elMap = elMapRef.current

          const mapEntry = elMap.get(target)

          if (mapEntry) {
            // Update visibility state.
            if (propsRef.current.disableHide && !entry.isIntersecting) continue
            mapEntry.setIsVisible(entry.isIntersecting)
          }
        }
      })
    },
    [propsRef, elMapRef],
  )

  // Wrap in useEffect to avoid SSR issues.
  useLayoutEffect(() => {
    if (props.rootRef && !props.rootRef.current) {
      return
    }

    const intersectionObserver = new IntersectionObserver(onObserver, {
      root: props.rootRef?.current ?? null,
      rootMargin: props.rootMargin ?? `${window.innerHeight / 2}px ${window.innerWidth / 2}px`,
    })

    setObserver(intersectionObserver)

    return () => {
      intersectionObserver?.disconnect()
    }
  }, [onObserver, props.rootMargin, props.rootRef])

  const value = useMemo(() => ({observer, elMapRef, avgRef}), [observer, elMapRef])

  return <ObserverContext.Provider value={value}>{props.children}</ObserverContext.Provider>
})

type UseIsVisibleProps = {
  /** Pointer to the virtualized DOM element */
  ref: React.RefObject<HTMLElement>

  /**
   * Initial height of the DOM element before it has been rendered.
   * If omitted, we'll attempt to estimate this value instead.
   */
  defaultHeight?: number
}

export default function useIsVisible({ref, defaultHeight}: UseIsVisibleProps): {isVisible: boolean; size: number} {
  const [isVisible, setIsVisible] = useState(false)
  const {observer, elMapRef, avgRef} = useContext(ObserverContext)
  const sizeRef = useRef(defaultHeight ?? avgRef.current?.avg)
  const didSetSize = useRef(false)

  // Do an initial calculation to see if we're in the viewport (this is less
  // efficient than checking the root, but that's fine for first load).
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const rect = element.getBoundingClientRect()

    if (
      rect.top < window.pageYOffset + window.innerHeight &&
      rect.left < window.pageXOffset + window.innerWidth &&
      rect.top + rect.height > window.pageYOffset &&
      rect.left + rect.width > window.pageXOffset
    ) {
      setIsVisible(true)
    }
  }, [ref])

  // Add the element to the ref map, and observe it. Also, set up a teardown
  // function when the component is unmounted.
  // This MUST be done in useLayoutEffect in order for the teardown function to
  // remove the element from the obsever synchronously before paint, where the
  // element is removed.
  useLayoutEffect(() => {
    const element = ref.current
    if (!element || !observer) return

    const elMap = elMapRef.current
    elMap.set(element, {setIsVisible})
    observer.observe(element)

    return () => {
      elMap.delete(element)
      observer.unobserve(element)
    }
  }, [elMapRef, observer, ref])

  // When the element becomes visible, update the size state to the current
  // actual element height. We update each time in case the height changes.
  //
  // This allows us to not rely on the average height for this component,
  // gradually building a more accurate virtualization of all components.
  //
  // We also update the average ref so that estimated heights become more
  // accurate over time.
  useEffect(() => {
    if (isVisible) {
      if (!ref.current || !avgRef.current) {
        return
      }

      const height = ref.current.getBoundingClientRect().height

      if (!defaultHeight && !didSetSize.current) {
        avgRef.current = {
          count: avgRef.current.count + 1,
          avg: (avgRef.current.count * avgRef.current.avg + height) / (avgRef.current.count + 1),
        }
      }

      didSetSize.current = true
      sizeRef.current = height
    }
  }, [avgRef, isVisible, ref, defaultHeight])

  return {isVisible, size: sizeRef.current}
}
