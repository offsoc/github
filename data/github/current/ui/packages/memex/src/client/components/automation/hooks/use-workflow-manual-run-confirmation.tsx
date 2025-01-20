import {type ConfirmationDialogProps, useConfirm} from '@primer/react'
import {useCallback} from 'react'

import type {ConfirmationSource} from '../../../helpers/workflow-utilities'
import {WorkflowResources} from '../../../strings'
import {SanitizedHtml} from '../../dom/sanitized-html'

export type OpenWorkflowManualRunConfirmationDialogParams = {
  confirmationSource: ConfirmationSource
  onConfirm: () => Promise<void>
  count?: number
  onDismiss?: () => void
}

const createConfirmOptions = (confirmationSource: ConfirmationSource, itemCount?: number) => ({
  title: WorkflowResources.manualRunConfirmationTitle(confirmationSource),
  content: (
    <SanitizedHtml>{WorkflowResources.manualRunConfirmationMessage(confirmationSource, itemCount)}</SanitizedHtml>
  ),
  confirmButtonContent: WorkflowResources.manualRunConfirmationButton(confirmationSource),
  confirmButtonType: 'primary' as ConfirmationDialogProps['confirmButtonType'],
})

export const useWorkflowManualRunConfirmation = () => {
  const confirm = useConfirm()

  const openWorkflowManualRunConfirmationDialog = useCallback(
    async ({confirmationSource, onConfirm, count, onDismiss}: OpenWorkflowManualRunConfirmationDialogParams) => {
      if (await confirm(createConfirmOptions(confirmationSource, count))) {
        await onConfirm()
      } else {
        onDismiss?.()
      }
    },
    [confirm],
  )

  return openWorkflowManualRunConfirmationDialog
}
