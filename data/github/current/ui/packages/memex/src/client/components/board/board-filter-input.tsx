import {memo, useCallback, useDeferredValue} from 'react'

import {shortcutFromEvent, SHORTCUTS} from '../../helpers/keyboard-shortcuts'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {usePaginatedTotalCount} from '../../state-providers/memex-items/queries/use-paginated-total-count'
import {BaseProjectViewFilterInput} from '../filter-bar/base-project-view-filter-input'
import {useBoardContext} from './board-context'
import {useOmnibarVisibility} from './hooks/use-omnibar-visibility'
import {
  focusCard,
  focusPrevious,
  focusSearchInput,
  isSearchInputFocus,
  useBoardNavigation,
  useStableBoardNavigation,
} from './navigation'

export const BoardFilterInput = memo(function BoardFilterInput() {
  const {navigationDispatch} = useStableBoardNavigation()

  const {
    state: {focus, previousFocus},
  } = useBoardNavigation()

  const dispatchInputFocus = useCallback(() => {
    navigationDispatch(focusSearchInput())
  }, [navigationDispatch])

  const {memex_table_without_limits} = useEnabledFeatures()
  const {filteredItems, groupedItems, groupByFieldOptions} = useBoardContext()
  // `memex_table_without_limits` will not change after initial render
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const totalCount = memex_table_without_limits ? usePaginatedTotalCount() : filteredItems.length
  const {enableOmnibar} = useOmnibarVisibility()

  const updateFocus = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (previousFocus && shortcutFromEvent(e) === SHORTCUTS.ESCAPE) {
        navigationDispatch(focusPrevious())
        return
      }

      for (const [horizontalGroupIndex, horizontalGroup] of groupedItems.horizontalGroups.entries()) {
        if (horizontalGroup.isCollapsed) continue

        for (const [verticalGroupIndex, verticalGroup] of groupByFieldOptions.entries()) {
          const currentVerticalGroup = horizontalGroup.itemsByVerticalGroup[verticalGroup.id]?.items
          if (currentVerticalGroup && currentVerticalGroup.length > 0) {
            const id = currentVerticalGroup[0]?.id
            if (!id) return
            navigationDispatch(focusCard(horizontalGroupIndex, verticalGroupIndex, id))
            return
          }
        }
      }

      enableOmnibar()
      e.preventDefault()
      e.stopPropagation()
    },
    [previousFocus, enableOmnibar, navigationDispatch, groupedItems.horizontalGroups, groupByFieldOptions],
  )

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>): void => {
      switch (shortcutFromEvent(e)) {
        case SHORTCUTS.ESCAPE:
          updateFocus(e)
          return
        case SHORTCUTS.ARROW_DOWN: {
          updateFocus(e)
          return
        }
      }
    },
    [updateFocus],
  )

  const onClearButtonKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>): void => {
      switch (shortcutFromEvent(e)) {
        case SHORTCUTS.ARROW_DOWN: {
          updateFocus(e)
          return
        }
      }
    },
    [updateFocus],
  )

  return (
    <BaseProjectViewFilterInput
      onInputKeyDown={onInputKeyDown}
      onClearButtonKeyDown={onClearButtonKeyDown}
      dispatchInputFocusEvent={dispatchInputFocus}
      isFocused={isSearchInputFocus(focus)}
      filterCount={useDeferredValue(totalCount)}
    />
  )
})
