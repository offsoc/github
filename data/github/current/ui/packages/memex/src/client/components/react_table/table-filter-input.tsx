import {type KeyboardEventHandler, memo, useCallback} from 'react'

import {shortcutFromEvent, SHORTCUTS} from '../../helpers/keyboard-shortcuts'
import {suppressEvents} from '../../navigation/keyboard'
import {FocusType, NavigationDirection} from '../../navigation/types'
import {BaseProjectViewFilterInput} from '../filter-bar/base-project-view-filter-input'
import {focusSearchInput, isSearchInputFocus, moveTableFocus, useTableNavigation} from './navigation'

export const TableFilterInput = memo(function TableFilterInput({filterCount}: {filterCount: number}) {
  const {
    state: {focus},
    navigationDispatch,
  } = useTableNavigation()

  const dispatchInputFocus = useCallback(() => {
    navigationDispatch(focusSearchInput())
  }, [navigationDispatch])

  const onInputKeyDown: KeyboardEventHandler = useCallback(
    e => {
      switch (shortcutFromEvent(e)) {
        case SHORTCUTS.ARROW_DOWN: {
          navigationDispatch(
            moveTableFocus({x: NavigationDirection.First, y: NavigationDirection.First, focusType: FocusType.Focus}),
          )
          suppressEvents(e)
          return
        }
      }
    },
    [navigationDispatch],
  )

  const onClearButtonKeyDown: KeyboardEventHandler = useCallback(
    e => {
      switch (shortcutFromEvent(e)) {
        case SHORTCUTS.ARROW_DOWN: {
          navigationDispatch(
            moveTableFocus({x: NavigationDirection.First, y: NavigationDirection.First, focusType: FocusType.Focus}),
          )
          suppressEvents(e)
          return
        }
      }
    },
    [navigationDispatch],
  )

  return (
    <BaseProjectViewFilterInput
      onInputKeyDown={onInputKeyDown}
      onClearButtonKeyDown={onClearButtonKeyDown}
      dispatchInputFocusEvent={dispatchInputFocus}
      isFocused={isSearchInputFocus(focus)}
      filterCount={filterCount}
    />
  )
})
