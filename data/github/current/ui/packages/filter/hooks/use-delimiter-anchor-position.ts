import {useLayoutEffect} from '@github-ui/use-layout-effect'
import type {AnchorPosition, PositionSettings} from '@primer/behaviors'
import {getAnchoredPosition} from '@primer/behaviors'
import {useProvidedRefOrCreate} from '@primer/react/lib-esm/hooks/useProvidedRefOrCreate'
import {useResizeObserver} from '@primer/react/lib-esm/hooks/useResizeObserver'
import {useCallback, useState} from 'react'

const lastDelimiterRegex = /:|,|\s(?=(?:[^"]*"[^"]*")*[^"]*$)/g

export interface AnchoredPositionHookSettings extends Partial<PositionSettings> {
  floatingElementRef?: React.RefObject<Element>
  caretElementRef?: React.RefObject<Element>
  inputElementRef: React.RefObject<HTMLInputElement>
}

/**
 * Calculates the top and left values for an absolutely-positioned floating element
 * to be anchored to some anchor element. Returns refs for the floating element
 * and the anchor element, along with the position.
 * @param settings Settings for calculating the anchored position.
 * @param dependencies Dependencies to determine when to re-calculate the position.
 * @returns An object of {top: number, left: number} to absolutely-position the
 * floating element.
 */
export function useDelimiterAnchorPosition(
  settings?: AnchoredPositionHookSettings,
  dependencies: React.DependencyList = [],
): {
  floatingElementRef: React.RefObject<Element>
  caretElementRef: React.RefObject<Element>
  position: AnchorPosition | undefined
  updatePosition: () => void
} {
  const floatingElementRef = useProvidedRefOrCreate(settings?.floatingElementRef)
  const caretElementRef = useProvidedRefOrCreate(settings?.caretElementRef)
  const inputElementRef = useProvidedRefOrCreate(settings?.inputElementRef)
  const [position, setPosition] = useState<AnchorPosition | undefined>(undefined)

  const closestDelimiter = () => {
    const delimiters = Array.from(
      inputElementRef.current?.closest('.styled-input-container')?.querySelectorAll('.delimiter') ?? [],
    )

    const filter = inputElementRef.current?.value
    if (!filter || !inputElementRef.current.selectionStart) return null
    const beforeCursorStr = filter.slice(0, inputElementRef.current.selectionStart)
    const matches = [...beforeCursorStr.matchAll(lastDelimiterRegex)]

    if (matches.length < 1) return inputElementRef.current
    // Verify valid delimiter
    let match
    for (let i = matches.length ?? 0; i > 0; i--) {
      const delimiter = delimiters?.[i - 1]
      if (delimiter && !delimiter?.classList.contains('text-delimiter')) {
        match = delimiter
        break
      }
    }

    return match ?? inputElementRef.current
  }

  const updatePosition = useCallback(
    () => {
      const delimiter = closestDelimiter() ?? inputElementRef.current
      if (floatingElementRef.current instanceof Element && delimiter instanceof Element) {
        setPosition(getAnchoredPosition(floatingElementRef.current, delimiter, settings))
      } else {
        setPosition(undefined)
      }
    },
    // This is intentional as it was causing too many calculations to be made
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [floatingElementRef, caretElementRef, ...dependencies],
  )

  useLayoutEffect(updatePosition, [updatePosition])

  useResizeObserver(updatePosition)

  return {
    floatingElementRef,
    caretElementRef,
    position,
    updatePosition,
  }
}
