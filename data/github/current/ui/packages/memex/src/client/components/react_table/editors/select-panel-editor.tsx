import {testIdProps} from '@github-ui/test-id-props'
import type {OverlayProps, TouchOrMouseEvent} from '@primer/react'
import {SelectPanel, type SelectPanelProps} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {type RefObject, useCallback, useEffect, useRef} from 'react'

import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../api/memex-items/item-type'
import {CellEditorUI, DraftConvert} from '../../../api/stats/contracts'
import {parseColumnId} from '../../../helpers/parsing'
import type {SupportedSuggestionOptions} from '../../../helpers/suggestions'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useSelectPanel, type UseSelectPanelProps} from '../../../hooks/editors/use-select-panel'
import type {MemexItemModel, RedactedItemModel} from '../../../models/memex-item-model'
import {FocusType, NavigationDirection} from '../../../navigation/types'
import {isValidDraftItemColumn} from '../../../state-providers/memex-items/memex-item-helpers'
import {RepoPicker} from '../../repo-picker'
import {CELL_HEIGHT} from '../constants'
import {moveTableFocus, useStableTableNavigation, useTableNavigationFocusInitialValue} from '../navigation'
import {cellEditorTestId} from '../test-identifiers'

type InteractableMemexItemModel = Exclude<MemexItemModel, RedactedItemModel>

const overlayProps: Partial<OverlayProps> = {
  width: 'small',
  onMouseDown: e => {
    // prevent click from bubbling out of the overlay, which would change focus state in the table cell
    e.stopPropagation()
  },
}

export type TSelectPanelEditorProps = Readonly<{
  model: InteractableMemexItemModel
  rowIndex: number
  columnId: string
}>

type SelectPanelEditorProps<T extends SupportedSuggestionOptions> = Pick<OverlayProps, 'height' | 'maxHeight'> &
  Omit<UseSelectPanelProps<T>, 'initialFilterValue' | 'onOpenChange' | 'renderAnchor'> & {
    model: InteractableMemexItemModel
    columnId: string
    rowIndex: number
    renderButton: () => React.ReactNode
  }

function showConvertToIssueRepositoryPicker({contentType}: {contentType: ItemType}, columnId: string) {
  // Only ever show the picker for draft issues
  if (contentType !== ItemType.DraftIssue) return false

  // Only show the picker if the column is not valid for drafts
  const parsedColumnId = parseColumnId(columnId)
  if (!parsedColumnId) return false
  return !isValidDraftItemColumn(parsedColumnId)
}

export function SelectPanelEditor<T extends SupportedSuggestionOptions>({
  model,
  columnId,
  rowIndex,
  renderButton,
  height,
  maxHeight,
  ...useSelectPanelProps
}: Omit<SelectPanelEditorProps<T>, 'open'>) {
  const {postStats} = usePostStats()
  const {navigationDispatch} = useStableTableNavigation()
  const initialFilterValue = useTableNavigationFocusInitialValue()
  const anchorRef = useRef<HTMLElement | null>(null)

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      const wrappedOnClick = (e: React.MouseEvent) => {
        // The default behavior of clicking on an open <summary /> button
        // is to hide the content in its parent <details /> element. We want to prevent
        // this default behavior so that in the scenario where a focused cell is double-clicked,
        // we do not show, and then immediately hide the menu.
        e.stopPropagation()
        e.preventDefault()
        // We want to handle detail being 0 or 1 here to account for keyboard
        // interactions with the summary element, which will fire an `onClick` event
        // when ESC or ENTER is pressed.
        if (e.nativeEvent.detail <= 1) {
          navigationDispatch(moveTableFocus({focusType: FocusType.Focus}))
        }
      }
      // Currently there is no way for us to own the anchor ref that is used by the AnchoredOverlay.
      // In the meantime, we use this as a work-around to get a ref, so that we can use it in determining
      // if the anchor was the target of the click in onClickOutside
      anchorRef.current = (anchorProps as React.HTMLAttributes<HTMLElement> & {ref: RefObject<HTMLElement>}).ref.current
      return (
        <summary
          {...anchorProps}
          onClick={wrappedOnClick}
          onKeyDown={anchorProps.onKeyDown}
          role="button"
          tabIndex={anchorProps.tabIndex}
          style={{height: CELL_HEIGHT - 1, outline: 'none', listStyle: 'none'}}
        >
          {renderButton()}
        </summary>
      )
    },
    [renderButton, navigationDispatch],
  )

  useEffect(() => {
    navigationDispatch(moveTableFocus({focusType: FocusType.Suspended}))
  }, [model.contentType, navigationDispatch])

  const onOpenChange = useCallback(
    (
      nextOpen: Parameters<SelectPanelProps['onOpenChange']>[0],
      gesture?: Parameters<SelectPanelProps['onOpenChange']>[1] | 'convert-confirmation',
      event?: React.KeyboardEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
    ) => {
      if (nextOpen) {
        return
      }

      switch (gesture) {
        case 'selection':
        case 'escape':
        case 'click-outside': {
          /**
           * Return focus to the cell when the panel is closed
           */
          const nextNavigation: Parameters<typeof moveTableFocus>[0] = {focusType: FocusType.Focus}

          /**
           * If the selection is made with the Enter key
           * move focus to the next row
           */
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          const isEnterKeypressEvent = event && 'key' in event && event.key === 'Enter'
          if (gesture === 'selection' && isEnterKeypressEvent) {
            nextNavigation.y = NavigationDirection.Next
          }

          return navigationDispatch(moveTableFocus(nextNavigation))
        }

        case 'convert-confirmation': {
          let nextNavigation: Parameters<typeof moveTableFocus>[0]
          if (columnId === SystemColumnId.Repository) {
            nextNavigation = {y: NavigationDirection.Next, focusType: FocusType.Focus}
            return navigationDispatch(moveTableFocus(nextNavigation))
          }
          return
        }
        case undefined:
        case 'anchor-click':
        case 'anchor-key-press':
        default: {
          return
        }
      }
    },
    [columnId, navigationDispatch],
  )

  const onClickOutside = useCallback(
    (e: TouchOrMouseEvent) => {
      if (e.target instanceof Element) {
        const nearestSummary = e.target.closest('summary')
        if (nearestSummary === anchorRef.current) {
          // If the target of the click event is the anchor, then we want to ignore closing the
          // Overlay, as the anchor's onClick will handle this.
          return
        }
      }

      onOpenChange(false, 'click-outside')
    },
    [onOpenChange],
  )

  const selectPanelProps = useSelectPanel({
    ...useSelectPanelProps,
    model,
    initialFilterValue,
    onOpenChange,
    columnId,
    renderAnchor,
  })

  /**
   * For Draft Issues, we show this repository picker to allow the user to choose a
   * repository and convert to an Issue, in order to edit it. This is only shown for
   * retricted columns.
   * */
  if (showConvertToIssueRepositoryPicker(model, columnId)) {
    const onRowConvertSuccess = () =>
      postStats({
        name: DraftConvert,
        ui: CellEditorUI,
        memexProjectItemId: model.id,
      })

    return (
      <RepoPicker
        renderAnchor={renderAnchor}
        isOpen
        showPrompt={columnId !== SystemColumnId.Repository}
        item={model}
        onOpenChange={onOpenChange}
        onSuccess={onRowConvertSuccess}
      />
    )
  }

  return (
    <SelectPanel
      {...selectPanelProps}
      overlayProps={{
        ...overlayProps,
        height,
        maxHeight,
        sx: {
          ...overlayProps.sx,
          animationDuration: '80ms',
        },
        onClickOutside,
        ...testIdProps(cellEditorTestId(rowIndex, columnId)),
      }}
    />
  )
}

SelectPanelEditor.displayName = 'SelectPanelEditor'
