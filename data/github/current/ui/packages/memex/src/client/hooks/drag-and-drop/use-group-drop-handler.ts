import {useConfirm} from '@primer/react'
import {useCallback} from 'react'

import type {UpdateColumnValueAction} from '../../api/columns/contracts/domain'
import type {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {type DragAndDropStatus, ItemDragAndDropName} from '../../api/stats/contracts'
import useToasts, {ToastType} from '../../components/toasts/use-toasts'
import {
  getUpdateGroupValidation,
  RegroupValidationStatus,
  RegroupValidationUIAction,
} from '../../features/grouping/get-group-update-validation'
import {createUpdateForGroup} from '../../features/grouping/helpers'
import {isForbiddenError, isRequestError} from '../../helpers/parsing'
import {useKeyPress} from '../../state-providers/keypress/key-press-provider'
import {Resources} from '../../strings'
import {usePostStats} from '../common/use-post-stats'
import {useAlert} from '../use-alert'
import {useEnabledFeatures} from '../use-enabled-features'
import {type DropEvent, isDropOnGroup} from './types'

const DefaultPermissionsErrorAlert = {
  title: Resources.cannotEditTitle,
  content: Resources.cannotEditItemContent,
  confirmButtonContent: Resources.confirmDialog,
}

export const useGetUpdateForGroupDropEvent = () => {
  const alert = useAlert()
  const confirm = useConfirm()
  const {addToast} = useToasts()
  const {postStats} = usePostStats()

  const postDropStats = useCallback(
    (status: DragAndDropStatus, itemId: number, columnId: SystemColumnId) => {
      postStats({
        name: ItemDragAndDropName,
        context: status,
        memexProjectItemId: itemId,
        memexProjectColumnId: columnId,
      })
    },
    [postStats],
  )

  const {memex_group_by_multi_value_changes} = useEnabledFeatures()
  const {ctrlKey} = useKeyPress()

  /** Build and validate the update for cross-group events. */
  const getUpdateForGroupDropEvent = useCallback(
    async (event: DropEvent): Promise<UpdateColumnValueAction | undefined> => {
      if (!isDropOnGroup(event)) return // updates only happen when dragging across groups

      let updateColumnAction = createUpdateForGroup(
        event.overItemGroup.sourceObject,
        event.activeItem.columns,
        {
          memex_group_by_multi_value_changes,
          ctrlKeyPressed: ctrlKey,
        },
        event.activeItemGroup.sourceObject,
      )

      const validation = await getUpdateGroupValidation(event.activeItem, updateColumnAction)

      if (validation.stats) {
        postDropStats(validation.stats.status, validation.stats.itemId, validation.stats.columnId)
      }

      if (validation.updateColumnActionOverride) {
        // Currently used by milestones, ensures that the milestone we are using is in the correct repo
        updateColumnAction = Object.assign({}, updateColumnAction, validation.updateColumnActionOverride)
      }

      if (
        validation.status === RegroupValidationStatus.Failure &&
        validation.action === RegroupValidationUIAction.Alert
      ) {
        await alert(validation.alertOptions)
      } else if (
        validation.status === RegroupValidationStatus.Failure &&
        validation.action === RegroupValidationUIAction.ErrorToast
      ) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast(validation.toastOptions)
        // If there is a confirmation message, show it and only proceed if the user confirms:
      } else if (validation.status !== RegroupValidationStatus.Pending || (await confirm(validation.confirmOptions))) {
        return updateColumnAction
      }
    },
    [addToast, alert, confirm, ctrlKey, memex_group_by_multi_value_changes, postDropStats],
  )

  const handleGroupDropRequestError = useCallback(
    (error: unknown, showAlertOnRequestError?: boolean) => {
      if (isForbiddenError(error)) {
        return alert(DefaultPermissionsErrorAlert)
      }

      if (isRequestError(error)) {
        // At the moment this is only used for the case where we want to show a dialog for sub-issue request errors
        if (showAlertOnRequestError) {
          return alert({
            title: "Item can't be moved",
            content: error.message,
          })
        } else {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          return addToast({message: error.message, type: ToastType.error})
        }
      }
    },
    [alert, addToast],
  )

  return {getUpdateForGroupDropEvent, handleGroupDropRequestError}
}
