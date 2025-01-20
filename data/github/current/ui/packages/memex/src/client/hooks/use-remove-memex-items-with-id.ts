import {useConfirm} from '@primer/react'
import {useCallback} from 'react'
import {flushSync} from 'react-dom'

import {ItemDeleteFromProject, type StatsItemActionFromProjectUI} from '../api/stats/contracts'
import {useRemoveMemexItems} from '../state-providers/memex-items/use-remove-memex-items'
import {usePostStats} from './common/use-post-stats'

export const useRemoveMemexItemWithConfirmation = (
  onOpen?: () => void,
  onAfterRemove?: (ids: Array<number>) => void,
  onDismiss?: () => void,
  onBeforeRemove?: () => void,
) => {
  const {postStats} = usePostStats()
  const {removeMemexItems} = useRemoveMemexItems()
  const {confirmRemoveItems} = useConfirmRemoveItems()

  const openRemoveConfirmationDialog = useCallback(
    async (ids: Array<number>, ui: StatsItemActionFromProjectUI, opts: {title?: string; content?: string} = {}) => {
      const removeItem = () => {
        onBeforeRemove?.()

        /**
         * We need to remove the items _before_ calling onConfirm
         * to ensure that the item state is cleared first
         */
        flushSync(() => {
          removeMemexItems(ids)
        })
        flushSync(() => {
          onAfterRemove?.(ids)
        })

        postStats({
          name: ItemDeleteFromProject,
          ui,
          numberOfRows: ids.length,
        })
      }

      onOpen?.()

      if (await confirmRemoveItems(ids, opts)) {
        removeItem()
      } else {
        onDismiss?.()
      }
    },
    [onOpen, confirmRemoveItems, onBeforeRemove, postStats, removeMemexItems, onAfterRemove, onDismiss],
  )

  return {openRemoveConfirmationDialog}
}

export function useConfirmRemoveItems() {
  const confirm = useConfirm()

  const confirmRemoveItems = useCallback(
    async (ids: Array<number>, opts: {title?: string; content?: string} = {}) => {
      const multiple = ids.length > 1
      return confirm({
        title: `Delete item${multiple ? 's' : ''}?`,
        content: `Are you sure you want to delete ${
          multiple ? `these ${ids.length} items` : 'this item'
        } from this project?`,
        confirmButtonContent: 'Delete',
        confirmButtonType: 'danger',
        ...opts,
      })
    },
    [confirm],
  )

  return {confirmRemoveItems}
}
