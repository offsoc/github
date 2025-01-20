import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {CopilotChatIntents, type FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {sendEvent} from '@github-ui/hydro-analytics'
import {ActionList} from '@primer/react'
import type {ReactElement} from 'react'

export interface DiffLinesDiscussMenuItemProps {
  fileDiffReference: FileDiffReference
  leadingVisual?: ReactElement
  eventContext?: Parameters<typeof sendEvent>[1]
  afterSelect?: () => void
}

export const DiffLinesDiscussMenuItem: React.FC<DiffLinesDiscussMenuItemProps> = ({
  fileDiffReference,
  leadingVisual,
  eventContext,
  afterSelect,
}) => {
  const handleDiscuss = () => {
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      references: [fileDiffReference],
    })
    sendEvent('copilot.file-diff.discuss', eventContext)
    afterSelect?.()
  }

  return (
    <ActionList.Item onSelect={handleDiscuss}>
      {leadingVisual && <ActionList.LeadingVisual>{leadingVisual}</ActionList.LeadingVisual>}
      Ask about this diff
    </ActionList.Item>
  )
}
