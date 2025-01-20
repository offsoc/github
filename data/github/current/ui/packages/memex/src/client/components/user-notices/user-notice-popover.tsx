import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {FocusKeys, getAnchoredPosition} from '@primer/behaviors'
import {Overlay, PointerBox, useFocusZone, useResizeObserver} from '@primer/react'
import {useCallback, useEffect, useLayoutEffect, useState, useSyncExternalStore} from 'react'

import {getInitialState} from '../../helpers/initial-state'
import {useSidePanel} from '../../hooks/use-side-panel'

type UserNoticePopoverProps = {
  anchorRef: React.MutableRefObject<HTMLDivElement | null>
  children: React.ReactNode
  imageToLoad?: string
}

const ALIGNMENT_OFFSET = -8
const ANCHOR_OFFSET = 12

export const UserNoticePopover = ({anchorRef, children, imageToLoad}: UserNoticePopoverProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const {showTemplateDialog} = getInitialState()
  const {isPaneOpened, containerRef} = useSidePanel()
  // useState instead of useRef so we can update the ref when the overlay is mounted
  // similar to https://github.com/primer/react/blob/abeef0bb5f361eb459ad55b79ee9b0e45b986d6f/packages/react/src/hooks/useRenderForcingRef.ts#L10
  const [overlayRef, setOverlayRef] = useState<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({top: 0, left: 0})
  const [caretPosition, setCaretPosition] = useState<'top-left' | 'top-right'>('top-left')

  const anchorInSidePanel = isPaneOpened && containerRef.current?.contains(anchorRef.current)

  const subscribe = useCallback(
    (notify: () => void) => {
      if (!anchorRef.current) return () => undefined
      const observer = new MutationObserver(notify)
      observer.observe(anchorRef.current, {
        attributes: true,
        characterData: false,
        childList: false,
        subtree: true,
      })
      return () => {
        observer.disconnect()
      }
    },
    [anchorRef],
  )

  // The display of the anchor ref for the view options menu is periodically toggled so that it can be positioned
  // appropriately after rendering or resizing the page. This ensures that the popover is displayed only when the anchor is visible.
  const getSnapshot = useCallback(() => {
    return Boolean(anchorRef.current && anchorRef.current.style.display !== 'none')
  }, [anchorRef])

  const isVisible = useSyncExternalStore(subscribe, getSnapshot)

  // Optionally wait for an image to load before displaying the popover
  useEffect(() => {
    if (!imageToLoad) return

    const img = document.createElement('img')
    img.src = imageToLoad
    img.onload = function () {
      setImageLoaded(true)
    }
  }, [imageToLoad, setImageLoaded])

  const updatePosition = useCallback(() => {
    if (!overlayRef || !anchorRef.current) return
    setPosition(
      getAnchoredPosition(overlayRef, anchorRef.current, {
        side: 'outside-top',
        align: 'start',
        alignmentOffset: ALIGNMENT_OFFSET,
        anchorOffset: ANCHOR_OFFSET,
      }),
    )
  }, [anchorRef, overlayRef, setPosition])

  // When the position changes, update the caret position
  // We assume here that the anchor is above the popover.
  useEffect(() => {
    if (!anchorRef.current) return

    const {left} = anchorRef.current.getBoundingClientRect()
    const isAlignedLeft = left + ALIGNMENT_OFFSET === position.left
    setCaretPosition(isAlignedLeft ? 'top-left' : 'top-right')
  }, [anchorRef, position, setCaretPosition])

  useLayoutEffect(updatePosition, [updatePosition])
  useResizeObserver(updatePosition)

  useFocusZone({containerRef: anchorRef, disabled: !position, bindKeys: FocusKeys.Tab})

  // Because of z-index issues with multiple portals, avoid showing user-notice for brand new projects
  if (showTemplateDialog) return null
  // If the side panel is open, don't show the popover. This is to avoid the popover showing over the side panel.
  // If the anchor is inside the side panel, we do want to show it.
  if (isPaneOpened && !anchorInSidePanel) return null
  if (!isVisible) return null
  if (imageToLoad && !imageLoaded) return null

  return (
    <Overlay
      returnFocusRef={anchorRef}
      ref={setOverlayRef}
      sx={{overflow: 'visible'}}
      {...testIdProps('user-notice-popover')}
      onClickOutside={noop}
      onEscape={noop}
      top={position.top}
      left={position.left}
    >
      <PointerBox
        caret={caretPosition}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 1,
          justifyContent: 'space-between',
          padding: 4,
          width: '326px',
        }}
      >
        {children}
      </PointerBox>
    </Overlay>
  )
}
