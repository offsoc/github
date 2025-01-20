import {useCallback} from 'react'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ParentIssue} from '../../api/common-contracts'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {isForbiddenError, isRequestError} from '../../helpers/parsing'
import {Resources} from '../../strings'
import {useAlert} from '../use-alert'
import {useUpdateItem} from '../use-update-item'

type UseTypeEditorProps = {
  model: SidePanelItem
  onSaved?: () => void
}

export function useParentIssueEditor({model, onSaved}: UseTypeEditorProps) {
  const {updateItem} = useUpdateItem()
  const alert = useAlert()

  const handleSaveSelectedRequestError = useCallback(
    (error: unknown) => {
      if (isForbiddenError(error)) {
        // Generic permission errors we use when updating items
        return alert({
          title: Resources.cannotEditTitle,
          content: Resources.cannotEditItemContent,
          confirmButtonContent: Resources.confirmDialog,
        })
      }

      if (isRequestError(error)) {
        return alert({
          title: "Parent issue can't be updated",
          content: error.message,
        })
      }
    },
    [alert],
  )

  const saveSelected = useCallback(
    async (parentIssue: ParentIssue | undefined) => {
      try {
        await updateItem(model, {
          dataType: MemexColumnDataType.ParentIssue,
          value: parentIssue,
        })
      } catch (error) {
        handleSaveSelectedRequestError(error)
      }

      onSaved?.()
    },
    [handleSaveSelectedRequestError, model, onSaved, updateItem],
  )

  return {
    saveSelected,
  }
}
