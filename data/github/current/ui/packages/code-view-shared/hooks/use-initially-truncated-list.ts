import {useCallback, useEffect, useState} from 'react'

/**
 * Returns a list that is initially truncated to `initialCount` items, and then
 * returns the full list after a short period of time. This is useful in cases
 * where we want to display a large list of items, we don't want to virtualize
 * (for UX or accessibility reasons), but we also don't want the DOM
 * reconciliation for all of these elements to block the user from seeing the
 * initial content. Using this hook, the user will see the first `initialCount`
 * items immediately, regardless of how long it takes to add the remaining
 * items.
 */
export function useInitiallyTruncatedList<T>(allItems: T[], initialCount: number): {truncated: boolean; items: T[]} {
  const initiallyTrucated = allItems.length > initialCount
  const [truncated, setTruncated] = useState(initiallyTrucated)

  useEffectAfterNextPaint(() => {
    if (truncated) setTruncated(false)
  }, [truncated])

  const items = truncated ? allItems.slice(0, initialCount) : allItems
  return {truncated, items}
}

function useEffectAfterNextPaint(doEffect: () => void, deps: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doEffectCallback = useCallback(doEffect, deps)

  useEffect(() => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null
    let frameHandle: ReturnType<typeof requestAnimationFrame> | null = null

    frameHandle = requestAnimationFrame(() => {
      // This animation frame callback will run immediately _before_ the next paint...
      timeoutHandle = setTimeout(() => {
        // ...but a 0ms timeout after that will run on the next tick _after_ that paint.
        doEffectCallback()

        timeoutHandle = null
      }, 0)

      frameHandle = null
    })

    return () => {
      if (timeoutHandle) clearTimeout(timeoutHandle)
      if (frameHandle) cancelAnimationFrame(frameHandle)
    }
  }, [doEffectCallback])
}
