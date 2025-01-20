import {useRef} from 'react'
import {Popover, useTheme} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'

export interface ValidationErrorPopoverProps {
  /**
   * ID of the error message. Supply this to the relevant input's `aria-errormessage` prop.
   * Be sure to also set the input's `aria-invalid` prop.
   */
  id: string
  /**
   * Message to display. If `undefined`, the popover will be hidden. This is preferred over
   * not rendering the popover at all because it allows screen readers to watch for changes
   * in the message through `aria-live`.
   */
  message?: string
  /**
   * Optional test ID override. The default test ID is `validation-error-popover`.
   */
  testId?: string
  /**
   * The minimum amount of space (pixels) between the popover and the clipping container
   * boundaries.
   */
  margin?: number
  /**
   * Position of the popover relative to the container. Defaults to `'below'`.
   */
  position?: 'above' | 'below'
}

/**
 * Returns the closest parent that would clip the popover, or the page `body` if there is none.
 */
const getClippingParent = (popover: HTMLElement) => {
  let parent: HTMLElement | null = popover.parentElement
  while (parent) {
    const computedStyles = getComputedStyle(parent)
    if (computedStyles.overflow !== 'visible' && computedStyles.position !== 'static') {
      return parent
    }
    parent = parent.parentElement
  }
  return document.body
}

/**
 * Shows a validation error without breaking the surrounding layout.
 * This component should be used inside a container with `position: relative` (along with
 * the annotated input element) to position it properly.
 *
 * For accessibility, it is better for this component to always be mounted in the
 * document even if the relevant input is valid, and for the ID of this component to remain
 * constant. Instead of conditionally rendering this component, hide it by setting the `message`
 * to `undefined`.
 *
 * It is not inserted at the document root like overlays, so it is more accessible to screen
 * readers by remaining in the right place in the document flow. However, it is more succeptible
 * to clipping issues. The popover will make a 'best effort' to position itself so that it won't
 * get clipped by a container, but it's not foolproof so try to set containing elements to
 * `overflow: visible` if they are not `position: static`.
 */
export const ValidationErrorPopover = ({
  id,
  message,
  testId,
  margin = 4,
  position = 'below',
}: ValidationErrorPopoverProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const open = message !== undefined

  const {theme} = useTheme()

  // Reposition the popover to fit inside the nearest container that would clip it.
  // Performing this only once per render could cause the popover to still get clipped (ie,
  // on scroll), but the user could always just scroll back to return it to the view. Adding
  // event listeners for scroll/resize could get very expensive.
  // We only reposition side-to-side for now.
  useLayoutEffect(() => {
    if (!open) return

    const popover = containerRef.current
    if (!popover) return
    const clippingParent = getClippingParent(popover)

    popover.style.maxWidth = `${clippingParent.clientWidth - margin * 2}px`

    // Rather than trying to 'predict' where the popover would end up before transforming it, just place
    // it in the ideal location and then figure out the smallest distance we need to move it to make it visible.
    popover.style.left = '50%'

    const popoverRect = popover.getBoundingClientRect()
    const clippingParentRect = clippingParent.getBoundingClientRect()

    const leftDistance = popoverRect.left - clippingParentRect.left
    const rightDistance = clippingParentRect.right - popoverRect.right

    const xOffset = leftDistance < margin ? -leftDistance + margin : rightDistance < margin ? rightDistance - margin : 0
    popover.style.left = `calc(50% + ${xOffset}px)`

    // Offset the caret in the opposite direction so it remains at the middle of the default position
    popover.style.setProperty('--caret-offset', `${-xOffset}px`)
  })

  const caretSx = {
    // !important is needed to override the color when position is 'above'
    [position === 'above' ? 'borderTopColor' : 'borderBottomColor']: `${theme?.colors.danger.fg ?? ''} !important`,
    left: `50%`,
    transform: `translateX(var(--caret-offset))`,
  }

  return (
    <Popover
      open={open}
      caret={position === 'above' ? 'bottom' : 'top'}
      sx={{
        top: position === 'above' ? `-4px` : `calc(100% + 12px)`,
        transform: `translateX(-50%)${position === 'above' ? ' translateY(-100%)' : ''}`,
        // Must use CSS variables to control the caret location because psuedo-elements are not selectable by JS
        '--caret-offset': '0',
        width: 'max-content',
        fontSize: 0,
      }}
      ref={containerRef}
    >
      <Popover.Content
        as="p"
        aria-live="polite"
        id={id}
        sx={{
          pt: 1,
          pb: 1,
          pr: 2,
          pl: 2,
          // Delegate width control to parent so max-width works
          width: 'auto',
          color: 'fg.onEmphasis',
          borderColor: 'danger.muted',
          backgroundColor: 'danger.emphasis',
          textAlign: 'center',
          '&::before': caretSx,
          '&::after': caretSx,
        }}
        {...testIdProps(testId ?? 'validation-error-popover')}
      >
        {message}
      </Popover.Content>
    </Popover>
  )
}
