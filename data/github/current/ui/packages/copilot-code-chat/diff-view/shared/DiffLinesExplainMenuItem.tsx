import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {CopilotChatIntents, type FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {sendEvent} from '@github-ui/hydro-analytics'
import {ActionList} from '@primer/react'

export interface DiffLinesExplainMenuItemProps {
  fileDiffReference: FileDiffReference
  eventContext?: Parameters<typeof sendEvent>[1]
  afterSelect?: () => void
}

export const DiffLinesExplainMenuItem: React.FC<DiffLinesExplainMenuItemProps> = ({
  fileDiffReference,
  eventContext,
  afterSelect,
}) => {
  const handleExplain = () => {
    publishOpenCopilotChat({
      content: 'Explain',
      intent: CopilotChatIntents.explainFileDiff,
      references: [fileDiffReference],
    })
    sendEvent('copilot.file-diff.explain', eventContext)
    afterSelect?.()
  }

  return <ActionList.Item onSelect={handleExplain}>Explain</ActionList.Item>
}
