import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Box, type SxProp} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, useCallback, useState} from 'react'

import getPositionOnScreen, {type XEdge, type YEdge} from '../../hooks/get-position-on-screen'

export function useAdjustPickerPosition(
  inputRef: React.RefObject<HTMLElement>,
  menuRef: React.RefObject<HTMLElement>,
  isOpen: boolean,
  deps: Array<any>,
  options?: Partial<{
    xAlign: XEdge
    yAlign: YEdge
  }>,
) {
  const [xAlignMemory, setXAlignMemory] = useState<XEdge | undefined>('left')
  const [yAlignMemory, setYAlignMemory] = useState<YEdge | undefined>('top')

  const adjustPickerPosition = useCallback(() => {
    if (!inputRef?.current || !menuRef.current) return

    const {top, left, xAlign, yAlign, hasContentDimensions} = getPositionOnScreen({
      originRef: inputRef,
      contentRef: menuRef,
      alignment: {
        xAlign: options?.xAlign ?? xAlignMemory,
        yAlign: options?.yAlign ?? yAlignMemory,
        yTopOffset: 0,
      },
    })

    menuRef.current.style.top = `${top}px`
    menuRef.current.style.left = `${left}px`

    if (!xAlignMemory && hasContentDimensions) {
      setXAlignMemory(xAlign)
    }

    if (!yAlignMemory && hasContentDimensions) {
      setYAlignMemory(yAlign)
    }
  }, [inputRef, menuRef, xAlignMemory, yAlignMemory, options])

  useLayoutEffect(() => {
    if (!isOpen) {
      setXAlignMemory(undefined)
      setYAlignMemory(undefined)
    }
    adjustPickerPosition()
    const resizeObserver = new ResizeObserver(adjustPickerPosition)
    resizeObserver.observe(document.documentElement)

    return () => {
      resizeObserver.unobserve(document.documentElement)
      resizeObserver.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustPickerPosition, isOpen, ...deps])

  return {adjustPickerPosition}
}

/**
 * For smaller viewports, ensure that the picker width and height do not extend beyond the viewport
 * The current width determination: calc(100vw - 52px) is determined by the width of the "Add item button" in the omnibar
 * along with some additional pixels to allow for padding.
 */

const OMNIBAR_OFFSET_X = 52
const OMNIBAR_OFFSET_Y = 60

type PickerListProps = SxProp & {
  offsetX?: number
  offsetY?: number
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLUListElement>

export const PickerList = forwardRef<HTMLUListElement, PickerListProps>((props, ref) => {
  return (
    <Box
      as="ul"
      role="listbox"
      ref={ref}
      {...props}
      sx={{
        width: `calc(100vw - ${props.offsetX ?? OMNIBAR_OFFSET_X}px)`,
        maxHeight: `calc(100vh - ${props.offsetY ?? OMNIBAR_OFFSET_Y}px)`,
        overflowY: 'auto',
        p: 0,
        m: 0,
        listStyle: 'none',
        bg: 'canvas.default',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        boxShadow: 'shadow.medium',
        position: 'absolute',
        zIndex: 100,
        fontSize: '12px',
        '@media (min-width: 544px)': {
          width: 'auto',
          minWidth: '400px',
        },
        ...props.sx,
      }}
    >
      {props.children}
    </Box>
  )
})

PickerList.displayName = 'PickerList'

type PickerItemProps = {children?: React.ReactNode} & React.HTMLAttributes<HTMLLIElement>

const pickerItemStyle: BetterSystemStyleObject = {
  cursor: 'pointer',
  display: 'block',
  fontSize: '12px',
  p: 2,
  '&:first-child': {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  '&[aria-selected="true"]': {
    color: 'fg.default',
    textDecoration: 'none',
    bg: 'canvas.subtle',
  },
}

export const PickerItem = forwardRef<HTMLLIElement, PickerItemProps>((props, ref) => {
  return (
    <Box as="li" ref={ref} {...props} sx={pickerItemStyle}>
      {props.children}
    </Box>
  )
})

PickerItem.displayName = 'PickerItem'
