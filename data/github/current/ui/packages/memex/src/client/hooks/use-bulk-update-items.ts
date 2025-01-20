import type {UpdateColumnValueAction} from '../api/columns/contracts/domain'
import useToasts from '../components/toasts/use-toasts'
import type {MemexItemModel} from '../models/memex-item-model'
import {ApiError} from '../platform/api-error'
import {
  MAX_BULK_ITEMS,
  useBulkUpdateItemColumnValues,
} from '../state-providers/column-values/use-bulk-update-item-column-value'
import {useHistory} from '../state-providers/history/history'
import {HistoryResources} from '../strings'
import {UpdateValidationError, validateUpdate} from './use-update-item'

export const useBulkUpdateItems = () => {
  const {bulkUpdateColumnValues} = useBulkUpdateItemColumnValues()

  const {addToast} = useToasts()

  const history = useHistory()

  /**
   * @param sourceRepoId If provided, will force labels, assignees, & milestones to be applied within the same repository. This is
   * stricter than the default behavior, which will attempt to search across repositories for matching values.
   * @param description Optional description of the action, used for the history stack. Should be a simple verb phrase.
   */
  const bulkUpdateSingleColumnValue = async (
    items: Array<MemexItemModel>,
    update: UpdateColumnValueAction,
    description = items.length === 1 ? HistoryResources.updateItem : HistoryResources.updateItems,
    sourceRepoId?: number | null,
  ) => {
    if (items.length > MAX_BULK_ITEMS) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        message: `Error updating items: Cannot update more than ${MAX_BULK_ITEMS} items at once`,
        type: 'error',
      })
      return
    }

    try {
      if (sourceRepoId !== undefined) validateUpdate(items, update, sourceRepoId)
      const itemUpdates = items.map(item => ({itemId: item.id, updates: [update]}))

      const undo = await bulkUpdateColumnValues(itemUpdates)
      history?.registerAction({
        revert: undo,
        description,
      })
    } catch (error) {
      if (error instanceof ApiError && !error.message.includes('not valid JSON')) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: `Error updating items: ${error.message}`,
          type: 'error',
        })
        throw error // rethrow to handle further up and log for stats
      } else if (error instanceof ApiError && error.status && error.status >= 500) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: 'Something went wrong, please try again.',
          type: 'error',
        })
      } else if (error instanceof UpdateValidationError) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: error.message,
          type: 'warning',
        })
      } else {
        throw error
      }
    }
  }

  const bulkUpdateMultipleColumnValues = async (
    itemUpdates: Array<{itemId: number; updates: Array<UpdateColumnValueAction>}>,
    description = itemUpdates.length === 1 ? HistoryResources.updateItem : HistoryResources.updateItems,
  ) => {
    if (itemUpdates.length > MAX_BULK_ITEMS) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        message: `Error updating items: Cannot update more than ${MAX_BULK_ITEMS} items at once`,
        type: 'error',
      })
      return
    }

    try {
      const undo = await bulkUpdateColumnValues(itemUpdates)
      history?.registerAction({
        revert: undo,
        description,
      })
    } catch (error) {
      if (error instanceof ApiError && !error.message.includes('not valid JSON')) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: `Error updating items: ${error.message}`,
          type: 'error',
        })
        throw error // rethrow to handle further up and log for stats
      } else if (error instanceof ApiError && error.status && error.status >= 500) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: 'Something went wrong, please try again.',
          type: 'error',
        })
      } else if (error instanceof UpdateValidationError) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: error.message,
          type: 'warning',
        })
      } else {
        throw error
      }
    }
  }

  return {
    bulkUpdateSingleColumnValue,
    bulkUpdateMultipleColumnValues,
  }
}
