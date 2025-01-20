import {useConfirm} from '@primer/react'
import {useCallback} from 'react'

import {ItemArchiveFromProject, type StatsItemActionFromProjectUI} from '../api/stats/contracts'
import {useArchiveMemexItems} from '../state-providers/memex-items/use-archive-memex-items'
import {Resources} from '../strings'
import {usePostStats} from './common/use-post-stats'

const createConfirmOptions = (
  pluralize: boolean,
  itemCount: number,
  confirmationTitle?: string,
  confirmationMessage?: string,
) => ({
  title: confirmationTitle || Resources.defaultArchiveConfirmationTitle(pluralize),
  content: confirmationMessage || Resources.defaultArchiveConfirmationMessage(pluralize, itemCount),
  confirmButtonContent: 'Archive',
})

export const useArchiveMemexItemsWithConfirmation = (
  onOpen?: () => void,
  onAfterRemove?: (ids: Array<number>) => void,
  onDismiss?: () => void,
  onBeforeRemove?: () => void,
) => {
  const {postStats} = usePostStats()
  const confirm = useConfirm()
  const {archiveMemexItems} = useArchiveMemexItems()

  const openArchiveConfirmationDialog = useCallback(
    async (
      ids: Array<number>,
      ui: StatsItemActionFromProjectUI,
      confirmationTitle?: string,
      confirmationMessage?: string,
    ) => {
      const multiple = ids.length > 1

      onOpen?.()

      const archiveItem = async () => {
        onBeforeRemove?.()
        await archiveMemexItems(ids)
        onAfterRemove?.(ids)
        postStats({
          name: ItemArchiveFromProject,
          ui,
          numberOfRows: ids.length,
        })
      }

      if (await confirm(createConfirmOptions(multiple, ids.length, confirmationTitle, confirmationMessage))) {
        archiveItem()
      } else {
        onDismiss?.()
      }
    },
    [onOpen, confirm, onBeforeRemove, archiveMemexItems, onAfterRemove, postStats, onDismiss],
  )

  return {openArchiveConfirmationDialog}
}
