import {useCallback} from 'react'

import {useHorizontalGroupedBy} from '../../../../features/grouping/hooks/use-horizontal-grouped-by'
import {resolveSortFunction} from '../../../../features/sorting/resolver'
import {DropSide} from '../../../../helpers/dnd-kit/drop-helpers'
import {type DropEvent, isDropOnGroup, isDropOnRow} from '../../../../hooks/drag-and-drop/types'
import {useGetUpdateForGroupDropEvent} from '../../../../hooks/drag-and-drop/use-group-drop-handler'
import {useSortedBy} from '../../../../hooks/use-sorted-by'
import {type UpdateItemActions, useUpdateAndReorderItem} from '../../../../hooks/use-update-item'
import type {ReorderItemData} from '../../../../state-providers/memex-items/types'
import {Resources} from '../../../../strings'
import useToasts, {ToastType} from '../../../toasts/use-toasts'
import {focusCell, useStableTableNavigation} from '../../navigation'
import {useTableInstance} from '../../table-provider'

/**
 * Strip fields that would result in no-ops. This avoids, for example, making an unecessary API call to update the grouped value
 * when dragging within the same group.
 */
const stripNoopFields = (event: DropEvent): DropEvent | undefined => {
  let strippedEvent: DropEvent | undefined = event

  // Remove start and end group if dragging in same group
  if (isDropOnGroup(strippedEvent)) {
    const {activeItemGroup: movingItemGroup, overItemGroup, ...rest} = strippedEvent

    // at this point if the event only contains the `movingItem` field, it's a total no-op and we can return undefined
    if (movingItemGroup.value === overItemGroup.value) strippedEvent = isDropOnRow(rest) ? rest : undefined
  }

  // Remove end row if dropped on source row
  if (strippedEvent && isDropOnRow(strippedEvent)) {
    const {overItem, side, ...rest} = strippedEvent

    if (strippedEvent.activeItem.id === overItem.id) strippedEvent = isDropOnGroup(rest) ? rest : undefined
  }

  return strippedEvent
}

export const useRowDropHandler = () => {
  const {updateAndReorderItem} = useUpdateAndReorderItem()
  const {addToast} = useToasts()
  const {sorts, clearSortedBy} = useSortedBy()
  const table = useTableInstance()
  const {navigationDispatch} = useStableTableNavigation()
  const {getUpdateForGroupDropEvent, handleGroupDropRequestError} = useGetUpdateForGroupDropEvent()
  const {toggleGroupCollapsed} = useHorizontalGroupedBy()

  const getVisibleItems = useCallback(
    () => table.flatRows.filter(r => !r.isGrouped).map(r => ({id: r.original.id})),
    [table],
  )

  /** If the group containing the row at `index` is collapsed, expand it. */
  const ensureExpandedGroup = useCallback(
    (itemId: number) => {
      const group = table.groupedRows?.find(g => g.subRows.some(r => r.original.id === itemId))
      if (group?.isCollapsed) {
        toggleGroupCollapsed(group.groupedValue)
        return true
      }
    },
    [table, toggleGroupCollapsed],
  )

  /** Select the row at `index` and focus the first cell in it. */
  const selectAndFocusItem = useCallback(
    (itemId: number) => {
      const newRow = table.flatRows.find(r => r.original.id === itemId)

      newRow?.toggleRowSelected?.(true)

      const firstColId = newRow?.cells[1]?.column.id
      if (firstColId) navigationDispatch(focusCell(newRow.id, firstColId, false, false))
    },
    [table, navigationDispatch],
  )

  const performUpdate = useCallback(
    async (itemId: number, action: UpdateItemActions) => {
      const updateColumnActions = action.updateColumnActions || []
      // If the update includes a parent issue update, we handle the error differently
      const hasParentIssueUpdate =
        updateColumnActions.filter(updateColumnAction => updateColumnAction.dataType === 'parentIssue').length > 0

      try {
        await updateAndReorderItem(itemId, action, {visibleItems: getVisibleItems()})

        ensureExpandedGroup(itemId)

        // `setTimeout` ensures the table has time to expand the group before operating on the row.
        // It's important that we _don't_ attempt to reuse the row instance from `ensureExpandedGroup`, as it will
        // have changed by now
        setTimeout(() => selectAndFocusItem(itemId))
      } catch (error) {
        return handleGroupDropRequestError(error, hasParentIssueUpdate)
      }
    },
    [getVisibleItems, ensureExpandedGroup, selectAndFocusItem, updateAndReorderItem, handleGroupDropRequestError],
  )

  /** Build the reorder for drops on rows. */
  const getReorderForEvent = useCallback(
    (event: DropEvent): ReorderItemData | undefined => {
      // When dragging onto a group header or footer and no target row is available (ie dropped onto header or omnibar),
      // move to end of group
      if (!isDropOnRow(event)) {
        const lastItemInGroup = table.groupedRows
          ?.find(r => r.groupedValue === event.overItemGroup.value)
          ?.subRows.at(-1)

        return lastItemInGroup
          ? {
              overItemId: lastItemInGroup.original.id,
              side: DropSide.AFTER,
            }
          : undefined
      }

      // Require the overRow has the same sorted values as the originalMovingRow before committing the reorder.
      for (const sort of sorts) {
        const compare = resolveSortFunction(sort.column)

        // If the sort values are different, we cannot move the item
        if (compare(event.activeItem, event.overItem, undefined, true) !== 0) {
          // If the user is dragging from group to group, don't show a toast because this is a valid action even if it
          // does mean the row might be moved to a place they didn't drag it to
          if (!isDropOnGroup(event)) {
            const action = {
              text: Resources.cannotReorderForSortAction,
              handleClick: () => clearSortedBy(),
            }

            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              message: Resources.cannotReorderForSortMessage,
              type: ToastType.warning,
              action,
            })
          }

          return
        }
      }

      return {
        overItemId: event.overItem.id,
        side: event.side,
      }
    },
    [addToast, clearSortedBy, sorts, table.groupedRows],
  )

  return useCallback(
    async (event_: DropEvent) => {
      const event = stripNoopFields(event_)
      if (!event) return

      const updateColumnAction = await getUpdateForGroupDropEvent(event)
      // Don't continue with reordering if validation of the update failed - that could cause the item to end up
      // somewhere totally unexpected
      if (isDropOnGroup(event) && !updateColumnAction) return

      const reorderData = getReorderForEvent(event)

      if (!reorderData && !updateColumnAction) return
      await performUpdate(event.activeItem.id, {
        reorderData,
        updateColumnActions: updateColumnAction ? [updateColumnAction] : [],
      })
    },
    [getUpdateForGroupDropEvent, getReorderForEvent, performUpdate],
  )
}
