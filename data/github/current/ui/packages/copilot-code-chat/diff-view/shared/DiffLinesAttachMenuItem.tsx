import {publishAddCopilotChatReference} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {sendEvent} from '@github-ui/hydro-analytics'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ActionList} from '@primer/react'

export interface DiffLinesAttachMenuItemProps {
  fileDiffReference: FileDiffReference
  eventContext?: Parameters<typeof sendEvent>[1]
  afterSelect?: () => void
}

export const DiffLinesAttachMenuItem: React.FC<DiffLinesAttachMenuItemProps> = ({
  fileDiffReference,
  eventContext,
  afterSelect,
}) => {
  const {addToast} = useToastContext()

  const handleAttach = () => {
    publishAddCopilotChatReference(fileDiffReference)
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({message: 'Reference added to thread', type: 'success'})
    sendEvent('copilot.file-diff.add', eventContext)
    afterSelect?.()
  }

  return <ActionList.Item onSelect={handleAttach}>Attach to current thread</ActionList.Item>
}
