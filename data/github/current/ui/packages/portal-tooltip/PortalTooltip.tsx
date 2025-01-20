import {getAnchoredPosition, type PositionSettings} from '@primer/behaviors'
import {forwardRef, useCallback, useImperativeHandle, useRef, useSyncExternalStore} from 'react'

import {ControlledTooltip, type ControlledTooltipProps} from './ControlledTooltip'
import {getScrollableParent} from '@github-ui/get-scrollable-parent'

export interface PortalTooltipProps extends ControlledTooltipProps {
  /**
   * A ref to the element that the tooltip should be positioned relative to
   */
  contentRef: React.RefObject<HTMLElement>
  anchoredPositionAlignment?: PositionSettings['align']
  anchorSide?: PositionSettings['side']
  anchorOffset?: number
  alignmentOffset?: number
  allowOutOfBounds?: boolean
  includeAriaAttributes?: boolean
}

/**
 * A tooltip that portals an uses absolute positioning to position itself relative to the contentRef
 *
 * it tricks scroll in the nearest scrollable parent to the contentRef to reposition itself.
 *
 * For now this uses the aria-label prop similar to the primer tooltip, but a more complete implementation
 * would allow for using children to tooltip rich content
 */
export const PortalTooltip = forwardRef<HTMLSpanElement, PortalTooltipProps & {id: string}>(function PortalTooltip(
  {contentRef, open, anchoredPositionAlignment, anchorSide, anchorOffset, alignmentOffset, allowOutOfBounds, ...props},
  forwardedRef,
) {
  const ref = useRef<HTMLSpanElement>(null)
  useImperativeHandle<HTMLSpanElement | null, HTMLSpanElement | null>(forwardedRef, () => ref.current)

  const positionCache = useRef<{left: number; top: number}>({left: 0, top: 0})
  const position = useSyncExternalStore(
    useCallback(
      notify => {
        if (!ref.current || !contentRef.current || !open) {
          return () => undefined
        }
        const scrollableParent = getScrollableParent(contentRef.current)
        // eslint-disable-next-line github/prefer-observers
        scrollableParent?.addEventListener('scroll', notify)
        return () => {
          scrollableParent?.removeEventListener('scroll', notify)
        }
      },
      [contentRef, open],
    ),
    useCallback(() => {
      if (!ref.current || !contentRef.current) {
        return positionCache.current
      }
      const nextPosition = getAnchoredPosition(ref.current, contentRef.current, {
        align: anchoredPositionAlignment ?? 'center',
        side: anchorSide ?? 'outside-top',
        alignmentOffset: alignmentOffset ?? 0,
        anchorOffset: anchorOffset ?? 0,
        allowOutOfBounds,
      })
      if (nextPosition.left !== positionCache.current.left || nextPosition.top !== positionCache.current.top) {
        positionCache.current = nextPosition
      }
      return positionCache.current
    }, [contentRef, alignmentOffset, anchorOffset, anchoredPositionAlignment, anchorSide, allowOutOfBounds]),
    useCallback(() => positionCache.current, []),
  )

  return (
    <ControlledTooltip
      {...props}
      ref={ref}
      open={open}
      style={{
        position: 'absolute',
        ...position,
        ...props.style,
      }}
    />
  )
})
