import {useTheme} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'
import {useElementWidth} from './use-element-width'

export type ContainerBreakpointFunction = <T, const A extends T[]>(array: A) => T | undefined

/**
 * When you provide an array to a CSS property in an `sx` attribute, you get easy responsive
 * design. But it's only responsive to the entire screen size, which has limited uses for
 * reusable components that could be rendered fullpage, in a modal, in a menu, etc.
 *
 * This hook lets you use the same array syntax but make it container-relative instead of
 * viewport-relative.
 *
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 * const breakpoint = useContainerBreakpoint(containerRef);
 *
 * return <Box sx={{bg: breakpoint(['red', 'green', 'blue'])}} />
 */
export const useContainerBreakpoint = (container: HTMLElement | null): ContainerBreakpointFunction => {
  const elementSizes = useElementWidth(container)
  const offsetWidth = elementSizes.offsetWidth && elementSizes.offsetWidth > 0 ? elementSizes.offsetWidth : 1280

  // We cannot know the size of the element until after it mounts, at which point we need to recalculate the styles
  const [, setState] = useState(false)
  useEffect(function rerenderOnMount() {
    setState(x => !x)
  }, [])

  const breakpoints = useTheme().theme?.breakpoints as [string, string, string, string] | undefined

  /**
   * Parsed theme breakpoints. The theme stores breakpoints as strings ending in 'px'. If
   * this fails to parse, will return array of `NaN`s, at which point the hook will default
   * to returning 0.
   */
  return useCallback(
    cssValues => {
      const breakpointWidths = breakpoints?.map(str => parseInt(str.match(/(\d+)px/)?.[1] ?? '', 10)) ?? []
      let index = breakpointWidths.findIndex(breakpoint => (offsetWidth ?? 0) < breakpoint)
      if (index === -1) index = breakpointWidths.length - 1

      return cssValues[Math.min(index, cssValues.length - 1)]
    },
    [breakpoints, offsetWidth],
  )
}
