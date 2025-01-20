import {type CloseGesture, DatePicker, type SubmitGesture} from '@github-ui/date-picker'
import {testIdProps} from '@github-ui/test-id-props'
import type {TouchOrMouseEvent} from '@primer/react'
import {formatISO} from 'date-fns'
import {memo, type RefObject, useCallback, useRef, useState} from 'react'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {DateValue} from '../../../api/columns/contracts/storage'
import {ItemValueAdd, ItemValueEdit} from '../../../api/stats/contracts'
import {formatDateString} from '../../../helpers/parsing'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useUpdateItem} from '../../../hooks/use-update-item'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {FocusType, NavigationDirection} from '../../../navigation/types'
import {CELL_HEIGHT} from '../constants'
import {moveTableFocus, useStableTableNavigation} from '../navigation'
import {DateRenderer} from '../renderers'
import {cellEditorTestId} from '../test-identifiers'

type Props = Readonly<{
  currentValue: ColumnValue<DateValue>
  columnId: number
  rowIndex: number
  replaceContents: boolean
  model: MemexItemModel
}>

const createDateValue = (nextValue: Date | null): DateValue | undefined =>
  nextValue ? {value: new Date(formatISO(nextValue, {representation: 'date'}))} : undefined

export const DateEditor: React.FC<Props> = memo(function DateEditor(props) {
  const {model, rowIndex, columnId, currentValue} = props
  const {updateItem} = useUpdateItem()
  const {postStats} = usePostStats()
  const [isOpen, setIsOpen] = useState(true)
  const {navigationDispatch} = useStableTableNavigation()
  const dateValue = !props.replaceContents && hasValue(currentValue) ? currentValue.value : null

  const closeDatePicker = useCallback(
    (gesture?: CloseGesture | SubmitGesture) => {
      setIsOpen(false)
      if (gesture === 'submit-key-press') {
        navigationDispatch(moveTableFocus({y: NavigationDirection.Next, focusType: FocusType.Focus}))
      } else {
        navigationDispatch(moveTableFocus({focusType: FocusType.Focus}))
      }
    },
    [navigationDispatch],
  )

  const handleUpdate = useCallback(
    async (newValue: Date | null) => {
      await updateItem(model, {
        dataType: MemexColumnDataType.Date,
        memexProjectColumnId: columnId,
        value: createDateValue(newValue),
      })
      postStats({
        name: dateValue ? ItemValueEdit : ItemValueAdd,
        memexProjectColumnId: columnId,
        memexProjectItemId: model.id,
      })
    },
    [columnId, dateValue, model, postStats, updateItem],
  )
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
          closeDatePicker()
        }
      }

      // Currently there is no way for us to own the anchor ref that is used by the AnchoredOverlay.
      // In the meantime, we use this as a work-around to get a ref, so that we can use it in determining
      // if the anchor was the target of the click in onClickOutside
      anchorRef.current = (anchorProps as React.HTMLAttributes<HTMLElement> & {ref: RefObject<HTMLElement>}).ref.current

      return (
        <summary
          {...anchorProps}
          {...testIdProps('table-cell-date-editor')}
          onClick={wrappedOnClick}
          onKeyDown={anchorProps.onKeyDown}
          role="button"
          tabIndex={anchorProps.tabIndex}
          style={{height: CELL_HEIGHT - 1, outline: 'none', listStyle: 'none'}}
        >
          <DateRenderer currentValue={currentValue} model={model} />
        </summary>
      )
    },
    [closeDatePicker, currentValue, model],
  )

  const onClickOutside = useCallback((e: TouchOrMouseEvent) => {
    if (e.target instanceof Element) {
      const nearestSummary = e.target.closest('summary')
      if (nearestSummary === anchorRef.current) {
        // If the target of the click event is the anchor, then we want to ignore closing the
        // Overlay, as the anchor's onClick will handle this.
        return
      }
    }
  }, [])

  return (
    <DatePicker
      open={isOpen}
      onChange={handleUpdate}
      onClose={closeDatePicker}
      value={dateValue ? new Date(formatDateString(dateValue.value)) : null}
      showTodayButton={false}
      showClearButton
      anchoredOverlayProps={{
        overlayProps: {
          onEscape: () => closeDatePicker(),
          onClickOutside,
          onMouseDown: e => {
            e.preventDefault()
          },
          ...testIdProps(cellEditorTestId(rowIndex, columnId.toString())),
        },
        focusTrapSettings: {restoreFocusOnCleanUp: false},
      }}
      anchor={renderAnchor}
    />
  )
})

DateEditor.displayName = 'DateEditor'
