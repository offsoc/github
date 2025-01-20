import type React from 'react'
import {memo, useMemo, useState, useEffect, useRef, useCallback} from 'react'
import {Box, Overlay, useFocusTrap, type TouchOrMouseEvent, IconButton} from '@primer/react'
import {XIcon} from '@primer/octicons-react'
import {copilotChatSearchInputId, copilotChatTextAreaId} from '@github-ui/copilot-chat/utils/constants'
import {useSlots} from '@primer/react/experimental'

type SidePanelProps = {
  children: React.ReactNode
  initialFocusRef?: React.RefObject<HTMLElement>
  returnFocusRef: React.RefObject<HTMLElement>
  /** In order to support transitions, the side panel should always be rendered but visibility should be controlled via this prop. */
  open: boolean
  onClose: (
    e: TouchOrMouseEvent | globalThis.KeyboardEvent | React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>,
  ) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  topOffset?: string | number
  width?: string | string[]
  /** Defines wether the default close element should be the close button (default), overlay, or the first focusable child element within the side-panel. */
  defaultCloseElement?: 'button' | 'overlay' | 'first-child'
  // Either a label string _or_ a labelledby reference is required
} & ({'aria-label': string; 'aria-labelledby'?: undefined} | {'aria-labelledby': string; 'aria-label'?: undefined})

const TRANSITION_DURATION_MS = 200

const SidePanelBase = memo(
  ({
    children,
    initialFocusRef,
    returnFocusRef,
    open,
    onClose,
    onKeyDown,
    topOffset = 0,
    width,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    defaultCloseElement = 'button',
  }: SidePanelProps) => {
    const containerWidth = useMemo(() => {
      if (Array.isArray(width)) {
        return width
      } else if (typeof width === 'string') {
        return ['100%', '', width]
      } else {
        return ['100%']
      }
    }, [width])

    const containerRef = useRef<HTMLDivElement>(null)
    // We need to disable/enable the focus trap so that it resets the focus trap when the modal is opened and the
    // container element changes, otherwise the sentinel elements will not be inserted and focus won't be trapped.
    const [focusTrapDisabled, setFocusTrapDisabled] = useState(containerRef.current === null || !open)
    const {initialFocusRef: internalInitialFocusRef} = useFocusTrap({
      initialFocusRef,
      containerRef,
      disabled: focusTrapDisabled,
    })

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const [rendered, setRendered] = useState(open)
    const [visible, setVisible] = useState(open)

    const [slots, childrenWithoutSlots] = useSlots(children, {
      heading: Heading,
    })

    useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout>
      if (open) {
        setRendered(true)
        timeoutId = setTimeout(() => setVisible(true))
      } else {
        setVisible(false)
        timeoutId = setTimeout(() => setRendered(false), TRANSITION_DURATION_MS)
      }

      return () => clearTimeout(timeoutId)
    }, [open])

    const onWindowClick = useCallback((e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.id === copilotChatTextAreaId || target.id === copilotChatSearchInputId) {
        setFocusTrapDisabled(true)
        window.setTimeout(() => target.focus())
      }
    }, [])

    const onPanelKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && e.shiftKey && e.key === 'C') {
          const input = document.querySelector(`#${copilotChatTextAreaId}, #${copilotChatSearchInputId}`) as HTMLElement
          if (input) {
            setFocusTrapDisabled(true)
            window.setTimeout(() => input.focus())
          }
        }
        if (onKeyDown) {
          onKeyDown(e)
        }
      },
      [onKeyDown],
    )

    useEffect(() => {
      window.addEventListener('click', onWindowClick)

      return () => {
        window.removeEventListener('click', onWindowClick)
      }
    }, [onWindowClick])

    useEffect(() => {
      const bodyOverflowStyle = document.body.style.overflow || ''
      // If the body is already set to overflow: hidden, it likely means
      // that there is already a modal open. In that case, we should bail
      // so we don't re-enable scroll after the second dialog is closed.
      if (bodyOverflowStyle === 'hidden') {
        return
      }

      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = bodyOverflowStyle
      }
    }, [])

    const onFocus = useCallback(() => {
      if (focusTrapDisabled) {
        setFocusTrapDisabled(!open)
      }
    }, [focusTrapDisabled, open])

    if (!rendered) return null

    return (
      <Overlay
        initialFocusRef={internalInitialFocusRef}
        returnFocusRef={returnFocusRef}
        onKeyDown={onPanelKeyDown}
        onEscape={onClose}
        onClickOutside={() => {
          // We don't need to handle clicks outside because we handle clicks on the backdrop instead. Handling clicks
          // outside can cause bugs where clicks on dialogs over the side panel (ie, a confirm dialog or menu) register
          // as clicks outside the side panel and attempt to close it.
        }}
        ref={containerRef}
        role="dialog"
        aria-modal
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        // without a height here, the dialog element will render with 0px height and test selectors will think it's hidden
        sx={{zIndex: 2, height: '1px', bg: 'none'}}
        onFocus={onFocus}
      >
        <Box
          sx={{
            backgroundColor: 'var(--overlay-backdrop-bgColor, var(--color-overlay-backdrop))',
            top: topOffset,
            right: 0,
            bottom: 0,
            left: 0,
            borderRadius: 0,
            position: 'fixed',
            border: 'none',
            transitionDuration: `${TRANSITION_DURATION_MS}ms`,
            transitionProperty: 'opacity',
            transitionTimingFunction: 'animation.easeOutCubic',
            opacity: visible ? 1 : 0,
            cursor: 'default',
            width: '100%',
          }}
          onClick={onClose}
          as={defaultCloseElement === 'overlay' ? 'button' : undefined}
          aria-label={defaultCloseElement === 'overlay' ? 'Close' : undefined}
        />
        <Box
          sx={{
            borderRadius: '12px 0 0 12px',
            position: 'fixed',
            top: topOffset,
            right: 0,
            bottom: 0,
            width: containerWidth,
            minWidth: '300px',
            maxWidth: 'unset',
            overflow: 'auto',
            bg: 'canvas.default',
            boxShadow: 'shadow.large',
            transitionDuration: `${TRANSITION_DURATION_MS}ms`,
            transitionProperty: 'opacity, transform',
            transitionTimingFunction: 'animation.easeOutCubic',
            // Don't slide in for users that prefer reduced motion. Fading is fine, but sliding is a big, distracting motion
            transform: visible || prefersReducedMotion ? 'translateX(0%)' : 'translateX(35%)',
            opacity: visible ? 1 : 0,
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div>{slots.heading}</div>
            <div>
              {defaultCloseElement === 'button' && (
                // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
                <IconButton
                  unsafeDisableTooltip={true}
                  variant="invisible"
                  icon={XIcon}
                  aria-label="Close"
                  onClick={onClose}
                  sx={{float: 'right', m: 3}}
                />
              )}
            </div>
          </Box>
          {childrenWithoutSlots}
        </Box>
      </Overlay>
    )
  },
)

SidePanelBase.displayName = 'SidePanel'

type SidePanelHeadingProps = {
  something?: string
}

const Heading = ({children}: React.PropsWithChildren<SidePanelHeadingProps>) => {
  return <div>{children}</div>
}

export const SidePanel = Object.assign(SidePanelBase, {Heading})
