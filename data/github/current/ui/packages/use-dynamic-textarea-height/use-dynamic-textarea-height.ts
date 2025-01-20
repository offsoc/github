import {useLayoutEffect} from '@github-ui/use-layout-effect'
import type {SxProp} from '@primer/react'
import {type RefObject, useCallback, useEffect, useState} from 'react'

type UseDynamicTextareaHeightSettings = {
  disabled?: boolean
  minHeightLines?: number
  maxHeightLines?: number
  elementRef: RefObject<HTMLTextAreaElement | null>
  /** The current value of the input. */
  value: string
}

/**
 * Calculates the optimal height of the textarea according to its content, automatically
 * resizing it as the user types. If the user manually resizes the textarea, their setting
 * will be respected.
 *
 * Returns an object to spread to the component's `sx` prop. If you are using `Textarea`,
 * apply this to the child `textarea` element: `<Textarea sx={{'& textarea': resultOfThisHook}} />`.
 *
 * NOTE: for the most accurate results, be sure that the `lineHeight` of the element is
 * explicitly set in CSS.
 */
export const useDynamicTextareaHeight = ({
  disabled,
  minHeightLines,
  maxHeightLines,
  elementRef,
  value,
}: UseDynamicTextareaHeightSettings): SxProp['sx'] => {
  const [height, setHeight] = useState<string | undefined>(undefined)
  const [minHeight, setMinHeight] = useState<string | undefined>(undefined)
  const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined)

  const refreshHeight = useCallback(() => {
    if (disabled) return

    const element = elementRef.current
    if (!element) return

    const computedStyles = getComputedStyle(element)

    // Using CSS calculations is fast and prevents us from having to parse anything
    setHeight(`calc(${element.scrollHeight}px - ${computedStyles.paddingTop} - ${computedStyles.paddingBottom})`)

    const lineHeight =
      computedStyles.lineHeight === 'normal' ? `1.2 * ${computedStyles.fontSize}` : computedStyles.lineHeight
    // We could use `clamp` to set the height, but setting it with min & max height also controls the resizability range
    if (minHeightLines !== undefined) setMinHeight(`calc(${minHeightLines} * ${lineHeight})`)
    if (maxHeightLines !== undefined) setMaxHeight(`calc(${maxHeightLines} * ${lineHeight})`)
    // `value` is an unnecessary dependency but it enables us to recalculate as the user types
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeightLines, maxHeightLines, value, elementRef, disabled])

  useLayoutEffect(refreshHeight, [refreshHeight])

  // With Slots, initial render of the component is delayed and so the initial layout effect can occur
  // before the target element has actually been calculated in the DOM. But if we only use regular effects,
  // there will be a visible flash on initial render when not using slots
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refreshHeight, [])

  return {height, minHeight, maxHeight, boxSizing: 'content-box'}
}
