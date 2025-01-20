import {callbackCancelledResult, useSafeAsyncCallback} from '@github-ui/use-safe-async-callback'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {UpdateColumnValueAction} from '../api/columns/contracts/domain'
import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import {ItemType} from '../api/memex-items/item-type'
import type {SidePanelItem} from '../api/memex-items/side-panel-item'
import {ItemOrder} from '../api/stats/contracts'
import useToasts from '../components/toasts/use-toasts'
import type {DropSide as DropSideType} from '../helpers/dnd-kit/drop-helpers'
import {DropSide} from '../helpers/dnd-kit/drop-helpers'
import type {RequireAtLeastOne} from '../helpers/type-utilities'
import {buildUpdateMemexItemActions, type MemexItemModel} from '../models/memex-item-model'
import {buildRevertForUpdate} from '../state-providers/column-values/column-value'
import {useUpdateItemColumnValue} from '../state-providers/column-values/use-update-item-column-value'
import {useHistory} from '../state-providers/history/history'
import {
  getMemexItemModelsFromQueryClient,
  type OptimisticUpdateRollbackData,
  rollbackMemexItemData,
} from '../state-providers/memex-items/query-client-api/memex-items'
import type {ReorderItemData} from '../state-providers/memex-items/types'
import {useFindMemexItem} from '../state-providers/memex-items/use-find-memex-item'
import {useSetNewRowPosition} from '../state-providers/memex-items/use-set-new-row-position'
import {HistoryResources, Resources} from '../strings'
import {usePostStats} from './common/use-post-stats'
import {useEnabledFeatures} from './use-enabled-features'

export type UpdateItemActions = RequireAtLeastOne<
  {reorderData: ReorderItemData} & {updateColumnActions: Array<UpdateColumnValueAction>}
>

interface UpdateItemContext {
  visibleItems?: Array<{id: number}>
}

/**
 * Provides a function to update a single column in an item.
 */
export function useUpdateItem() {
  const {updateColumnValueAndPriority} = useUpdateItemColumnValue()
  const safeUpdateColumnValueAndPriority = useSafeAsyncCallback(updateColumnValueAndPriority, true)
  const {addToast} = useToasts()
  const {findMemexItem} = useFindMemexItem()
  const safeFindMemexItem = useSafeAsyncCallback(findMemexItem, true)

  const history = useHistory()

  /**
   * @param sourceRepoId If provided, will force labels, assignees, & milestones to be applied within the same repository. This is
   * stricter than the default behavior, which will attempt to search across repositories for matching values.
   */
  const updateItem = useCallback(
    async (
      item: SidePanelItem,
      update: UpdateColumnValueAction,
      description = HistoryResources.updateItem,
      sourceRepoId?: number | null,
    ) => {
      const memexItem = item as MemexItemModel
      if (!memexItem) {
        return Promise.resolve()
      }

      if (sourceRepoId !== undefined) {
        try {
          validateUpdate([memexItem], update, sourceRepoId)
        } catch (error) {
          if (error instanceof UpdateValidationError) {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              message: error.message,
              type: 'warning',
            })
            return
          } else {
            throw error
          }
        }
      }

      const revertUpdate = buildRevertForUpdate(update, memexItem)

      await safeUpdateColumnValueAndPriority(memexItem, {columnValues: [update]})

      history?.registerAction({
        description,
        revert: async () => {
          // It isn't safe to reuse `item` now that it has been updated
          const latestItem = safeFindMemexItem(item.id)
          if (typeof latestItem === 'object')
            await safeUpdateColumnValueAndPriority(latestItem, {columnValues: [revertUpdate]})
        },
      })
    },
    [safeUpdateColumnValueAndPriority, safeFindMemexItem, addToast, history],
  )

  return {updateItem}
}

/**
 * Given an item's id, and the id of an item to insert before or after,
 * finds the index in the list of items to insert at.
 * @param allItems - List of all of the MemexItemModels to search through
 * @param {number}  id - the id of the item to move
 * @param {number}  overItemId - the id of the item to insert before or after
 * @param {string}  side - "top" to insert above, "bottom" to insert below.
 */
function getNewIndexForMovingItem(
  allItems: Readonly<Array<{id: number}>>,
  id: number,
  overItemId: number,
  side: DropSideType,
) {
  const currentIndex = allItems.findIndex(i => i.id === id)
  if (currentIndex < 0) {
    return -1
  }

  const overItemIndex = allItems.findIndex(i => i.id === overItemId)
  if (overItemIndex < 0) {
    return -1
  }

  let newIndexForItem = -1

  if (overItemIndex > currentIndex) {
    // destination is below source - use previous item if on top side
    newIndexForItem = side === DropSide.BEFORE ? overItemIndex - 1 : overItemIndex
  } else {
    // destination is above source - use next item if on bottom side
    newIndexForItem = side === DropSide.BEFORE ? overItemIndex : overItemIndex + 1
  }
  return newIndexForItem
}

/**
 * This hook provides a function - updateAndReorderItem - which can be called to update the display order of a memex item
 * and / or a column value for the item
 */
export function useUpdateAndReorderItem() {
  const {memex_table_without_limits} = useEnabledFeatures()
  const {postStats} = usePostStats()
  const {setNewRowPosition, setNewPositionForMWL} = useSetNewRowPosition()
  const {findMemexItem} = useFindMemexItem()
  const {updateColumnValueAndPriority} = useUpdateItemColumnValue()
  const queryClient = useQueryClient()
  const history = useHistory()

  const performUpdate = useCallback(
    async (
      item: MemexItemModel,
      {reorderData, updateColumnActions}: UpdateItemActions,
      {visibleItems}: UpdateItemContext,
    ) => {
      let newIndexForRow: number | undefined = undefined
      let prevIndexForRow: number | undefined = undefined
      let previousItemId: number | '' | undefined = undefined
      let rollbackData: OptimisticUpdateRollbackData | undefined = undefined

      if (reorderData) {
        if (memex_table_without_limits) {
          const result = setNewPositionForMWL(item.id, reorderData)
          previousItemId = result?.previousItemId
          rollbackData = result?.rollbackData
        } else {
          // When the MWL FF is disabled, we will
          // always have an overItemId, but this check
          // helps give us proper type safety.
          if ('overItemId' in reorderData) {
            newIndexForRow = getNewIndexForMovingItem(
              getMemexItemModelsFromQueryClient(queryClient),
              item.id,
              reorderData.overItemId,
              reorderData.side,
            )
            const result = setNewRowPosition(item.id, newIndexForRow)
            previousItemId = result.previousItemId
            prevIndexForRow = result.previousMovingItemIndex
          }
        }
      }
      const updateMemexItemActions = buildUpdateMemexItemActions(updateColumnActions, previousItemId)
      if (!updateMemexItemActions) {
        return
      }

      try {
        await updateColumnValueAndPriority(item, updateMemexItemActions)
      } catch (error) {
        // revert the change to the item's priority and continue error propagation
        if (prevIndexForRow !== undefined && prevIndexForRow >= 0) {
          setNewRowPosition(item.id, prevIndexForRow)
        } else if (rollbackData) {
          rollbackMemexItemData(queryClient, rollbackData)
        }
        throw error
      }

      // If user is in search mode, we need to return the new position in the filtered set
      // but still in the store we set the position within allItems
      if (reorderData && 'overItemId' in reorderData && visibleItems) {
        // use filtered items
        newIndexForRow = getNewIndexForMovingItem(visibleItems, item.id, reorderData.overItemId, reorderData.side)
      }

      postStats({
        name: ItemOrder,
        context: `position: ${newIndexForRow}`,
        memexProjectItemId: item.id,
      })

      return {newIndexForRow, prevIndexForRow}
    },
    [
      memex_table_without_limits,
      postStats,
      queryClient,
      setNewPositionForMWL,
      setNewRowPosition,
      updateColumnValueAndPriority,
    ],
  )

  const safePerformUpdate = useSafeAsyncCallback(performUpdate, true)
  const safeFindMemexItem = useSafeAsyncCallback(findMemexItem, true)

  const buildRevertForReorder = useCallback(
    (item: MemexItemModel): ReorderItemData | undefined => {
      const allItems = getMemexItemModelsFromQueryClient(queryClient)

      const currentIndex = allItems.findIndex(i => i.id === item.id)
      const currentPrevItem = allItems[currentIndex - 1]
      if (currentPrevItem) return {overItemId: currentPrevItem.id, side: DropSide.AFTER}

      const firstItem = allItems[0]
      if (firstItem) return {overItemId: firstItem.id, side: DropSide.BEFORE}
    },
    [queryClient],
  )

  const updateAndReorderItem = useCallback(
    async (id: number, actions: UpdateItemActions, items: UpdateItemContext) => {
      const item = findMemexItem(id)
      if (!item) return

      const revertColumnActions = actions.updateColumnActions?.map(action => buildRevertForUpdate(action, item))
      const revertReorder = buildRevertForReorder(item)

      // Everything inside this revert method must be 'safe' or it could be outdated by the time the user undos
      const revert = async () => {
        // It's not safe to reuse the previously found item, since it will have been updated now
        const updatedItem = safeFindMemexItem(id)
        if (!updatedItem || updatedItem === callbackCancelledResult) return

        if (revertColumnActions || revertReorder)
          await safePerformUpdate(
            updatedItem,
            {updateColumnActions: revertColumnActions, reorderData: revertReorder} as UpdateItemActions,
            {},
          )
      }

      const newIndex = await performUpdate(item, actions, items)

      history?.registerAction({
        description: HistoryResources.moveItem,
        revert,
      })

      return newIndex
    },
    [findMemexItem, buildRevertForReorder, performUpdate, history, safeFindMemexItem, safePerformUpdate],
  )

  return {updateAndReorderItem}
}

export function buildUpdateItemActions(
  updateColumnActions: Array<UpdateColumnValueAction> | undefined,
  reorderData: ReorderItemData | undefined,
): UpdateItemActions | undefined {
  if (updateColumnActions?.length && reorderData) {
    return {reorderData, updateColumnActions}
  }

  if (updateColumnActions?.length) {
    return {updateColumnActions}
  }

  if (reorderData) {
    return {reorderData}
  }

  // Ideally, we'd be able to build this item without possibly returning `undefined`
  // as that is not a valid case. However, at all of the callsites of updateAndReorderItem
  // we don't know for sure which (or both) of the two pieces of data is defined, so
  // we need to use a run-time check to validate
  return undefined
}

export class UpdateValidationError extends Error {}

/**
 * Attempt to validate the update on the client side to avoid an unecessary round trip if we know it will fail.
 * @throws {UpdateValidationError} if the update is known not to be valid on the given items.
 */
export function validateUpdate(
  items: Array<MemexItemModel>,
  update: UpdateColumnValueAction,
  sourceRepoId: number | null,
): void {
  switch (update.dataType) {
    case MemexColumnDataType.Assignees:
      for (const item of items)
        if (
          (item.contentType === ItemType.Issue || item.contentType === ItemType.PullRequest) &&
          sourceRepoId !== item.contentRepositoryId
        )
          throw new UpdateValidationError(Resources.unableToPasteAssigneesBetweensRepos)

      break

    case MemexColumnDataType.Milestone:
      for (const item of items) {
        if (item.contentType === ItemType.DraftIssue)
          throw new UpdateValidationError(Resources.unableToPasteMilestonesOnDraftIssue)
        if (sourceRepoId !== item.contentRepositoryId)
          throw new UpdateValidationError(Resources.unableToPasteMilestonesBetweensRepos)
      }
      break

    case MemexColumnDataType.IssueType:
      for (const item of items) {
        if (item.contentType === ItemType.DraftIssue)
          throw new UpdateValidationError(Resources.unableToPasteIssueTypesOnDraftIssue)
        if (item.contentType === ItemType.PullRequest)
          throw new UpdateValidationError(Resources.unableToPasteIssueTypesOnPullRequest)
      }
      break

    case MemexColumnDataType.ParentIssue:
      for (const item of items) {
        if (item.contentType === ItemType.DraftIssue)
          throw new UpdateValidationError(Resources.unableToPasteParentIssueOnDraftIssue)
        if (item.contentType === ItemType.PullRequest)
          throw new UpdateValidationError(Resources.unableToPasteParentIssueOnPullRequest)
      }
      break

    case MemexColumnDataType.Labels:
      for (const item of items) {
        if (item.contentType === ItemType.DraftIssue)
          throw new UpdateValidationError(Resources.unableToPasteLabelsOnDraftIssue)
        if (sourceRepoId !== item.contentRepositoryId)
          throw new UpdateValidationError(Resources.unableToPasteLabelsBetweensRepos)
      }
  }
}
