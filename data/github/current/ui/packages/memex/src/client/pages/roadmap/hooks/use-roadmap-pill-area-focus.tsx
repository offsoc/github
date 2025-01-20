import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {createContext, memo, type ReactNode, useCallback, useContext, useMemo, useRef, useState} from 'react'
import type {EditorCellProps, RendererCellProps} from 'react-table'

import {ItemType} from '../../../api/memex-items/item-type'
import {focusCell, isCellFocus, useTableNavigation} from '../../../components/react_table/navigation'
import type {TableDataType} from '../../../components/react_table/table-data-type'
import {shortcutFromEvent, SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {useSidePanel} from '../../../hooks/use-side-panel'
import {handleKeyboardNavigation, suppressEvents} from '../../../navigation/keyboard'
import {isWebkit} from '../../../platform/user-agent'

type RoadmapPillAreaFocusProviderProps = {
  cell: Pick<RendererCellProps<TableDataType> | EditorCellProps<TableDataType>, 'column' | 'row'>
  children: ReactNode
  /** Used to anchor autoscrolling when a new item is focused */
  rowRef: React.RefObject<HTMLDivElement>
}

export const PillAreaFocusType = {
  PillLink: 'pill_link',
  ArrowButton: 'arrow_button',
  AddDateButton: 'add_dates_button',
} as const
export type PillAreaFocusType = ObjectValues<typeof PillAreaFocusType>

export type RoadmapPillAreaFocusWrapperProps = {
  onKeyDown: React.KeyboardEventHandler<Element>
  onPointerDown: React.MouseEventHandler<Element>
  tabIndex: number
}
export const RoadmapPillAreaFocusContext = createContext<{
  /** Props applied to roadmap gridcell compoents to make sure focus is synchronised with navigation state */
  wrapperProps: RoadmapPillAreaFocusWrapperProps
  /** Ref to focus when the roadmap pill is visible */
  linkRef: React.RefObject<HTMLAnchorElement>
  /** Ref to focus when the roadmap item is out of view */
  arrowButtonRef: React.RefObject<HTMLButtonElement>
  /** Ref to focus when the roadmap item is missing dates */
  addDateButtonRef: React.RefObject<HTMLButtonElement>
  /** Refocuses the correct roadmap element, useful when pill visibility changes, and/or dates are added */
  refocusPillArea: () => void
  /** Sets cell focus when an interactive element is clicked */
  onFocusInternalElement: React.FocusEventHandler<Element>
  /** If the cell area is focused, indicates which element contains focus */
  focusType: PillAreaFocusType | undefined
  /** Click handler for visible pill elements */
  onClickPillLink: React.MouseEventHandler<Element>
  /** Temporarily suppress pill link click events. Useful during drag operations and pending saves */
  temporarilyIgnorePillLinkClick: (ms?: number) => void
} | null>(null)

export const RoadmapPillAreaFocusProvider = memo(function RoadmapPillAreaFocusProvider({
  children,
  cell,
  rowRef,
}: RoadmapPillAreaFocusProviderProps) {
  const {
    state: {focus},
    navigationDispatch,
  } = useTableNavigation()
  const [pillAreaFocus, setPillAreaFocus] = useState<{
    type: PillAreaFocusType
    element: HTMLElement
  } | null>(null)

  const isFocused = useMemo(
    () => !!(focus && isCellFocus(focus) && focus.details.y === cell.row.id && focus.details.x === cell.column.id),
    [cell, focus],
  )

  const currentFocusRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const arrowButtonRef = useRef<HTMLButtonElement>(null)
  const addDateButtonRef = useRef<HTMLButtonElement>(null)

  const getPillAreaFocus = useCallback(() => {
    if (arrowButtonRef.current) {
      return {
        type: PillAreaFocusType.ArrowButton,
        element: arrowButtonRef.current,
      }
    } else if (addDateButtonRef.current) {
      return {
        type: PillAreaFocusType.AddDateButton,
        element: addDateButtonRef.current,
      }
    } else if (linkRef.current) {
      return {
        type: PillAreaFocusType.PillLink,
        element: linkRef.current,
      }
    }
    return null
  }, [])

  const getPillAreaFocusChanged = useCallback((newFocusEl?: HTMLElement) => {
    if (!newFocusEl) {
      return !!currentFocusRef.current
    }
    return currentFocusRef.current !== newFocusEl
  }, [])

  const focusPillElement = useCallback(
    (opts: {scrollIntoView: boolean}) => {
      const newFocus = getPillAreaFocus()
      const pillAreaFocusChanged = getPillAreaFocusChanged(newFocus?.element)

      if (pillAreaFocusChanged) {
        setPillAreaFocus(newFocus)
        currentFocusRef.current = newFocus?.element ?? null
      }

      if (newFocus?.element) {
        newFocus.element.focus({preventScroll: true})
        if (!opts.scrollIntoView) return

        if (rowRef.current) {
          if (!isWebkit()) {
            rowRef.current.scrollIntoView({block: 'nearest', inline: 'nearest'})
          } else if (
            'scrollIntoViewIfNeeded' in rowRef.current &&
            typeof rowRef.current.scrollIntoViewIfNeeded === 'function'
          ) {
            // This is part of webkit only, but not part of the official standard.
            rowRef.current.scrollIntoViewIfNeeded(false)
          }
        }
      }
    },
    [getPillAreaFocus, getPillAreaFocusChanged, rowRef],
  )

  const refocusPillArea = useCallback(() => {
    if (isFocused) {
      focusPillElement({scrollIntoView: false})
    }
  }, [isFocused, focusPillElement])

  useLayoutEffect(() => {
    if (isFocused) {
      focusPillElement({scrollIntoView: true})
    } else {
      setPillAreaFocus(null)
      currentFocusRef.current = null
    }
  }, [isFocused, focusPillElement, setPillAreaFocus])

  const {openProjectItemInPane} = useSidePanel()

  // Ignore the mouse click event immediately after an item pill drag operation.
  // This allows dragging by the item pill link without opening the side panel after.
  const ignoreLinkClick = useRef(false)
  const temporarilyIgnorePillLinkClick = useCallback((ms = 200) => {
    ignoreLinkClick.current = true
    window.setTimeout(() => {
      ignoreLinkClick.current = false
    }, ms)
  }, [])

  const item = cell.row.original
  const canOpenSidePanel = item.contentType === ItemType.DraftIssue || item.contentType === ItemType.Issue
  const onClickPillLink: React.MouseEventHandler = useCallback(
    e => {
      if (ignoreLinkClick.current) {
        e.preventDefault()
        return
      }
      if (!canOpenSidePanel) {
        return
      }
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if ((e.metaKey || e.ctrlKey) && item.contentType !== ItemType.DraftIssue) {
        return
      }
      openProjectItemInPane(item, () => {
        linkRef.current?.focus()
      })
      e.preventDefault()
    },
    [openProjectItemInPane, item, linkRef, canOpenSidePanel],
  )

  const focusType = pillAreaFocus?.type
  const onKeyDown: React.KeyboardEventHandler = useCallback(
    e => {
      const shortcut = shortcutFromEvent(e)

      const result = handleKeyboardNavigation(navigationDispatch, e)
      if (result.action) {
        suppressEvents(e)
      } else if (focusType === PillAreaFocusType.PillLink && shortcut === SHORTCUTS.SPACE && canOpenSidePanel) {
        openProjectItemInPane(item, () => {
          linkRef.current?.focus()
        })
        suppressEvents(e)
      }
    },
    [navigationDispatch, canOpenSidePanel, openProjectItemInPane, item, focusType],
  )

  const onPointerDown: React.MouseEventHandler = useCallback(() => {
    if (!isFocused) {
      navigationDispatch(focusCell(cell.row.id, cell.column.id, false))
    }
  }, [isFocused, navigationDispatch, cell])

  const onFocusInternalElement: React.FocusEventHandler = useCallback(() => {
    if (!isFocused) {
      navigationDispatch(focusCell(cell.row.id, cell.column.id, false))
    }
  }, [isFocused, navigationDispatch, cell])

  return (
    <RoadmapPillAreaFocusContext.Provider
      value={useMemo(
        () => ({
          wrapperProps: {
            onKeyDown,
            onPointerDown,
            tabIndex: -1,
          },
          onFocusInternalElement,
          linkRef,
          onClickPillLink,
          temporarilyIgnorePillLinkClick,
          arrowButtonRef,
          addDateButtonRef,
          refocusPillArea,
          focusType,
        }),
        [
          onKeyDown,
          onPointerDown,
          onFocusInternalElement,
          onClickPillLink,
          temporarilyIgnorePillLinkClick,
          refocusPillArea,
          focusType,
        ],
      )}
    >
      {children}
    </RoadmapPillAreaFocusContext.Provider>
  )
})

export const useRoadmapPillAreaFocus = () => {
  const ctx = useContext(RoadmapPillAreaFocusContext)
  if (!ctx) {
    throw new Error('useRoadmapPillAreaFocus must be used within a RoadmapPillAreaFocusContext')
  }
  return ctx
}
