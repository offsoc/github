import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {CopilotChatIntents, type FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {sendEvent} from '@github-ui/hydro-analytics'

import {AskCopilotButton} from '../../AskCopilotButton'

const DIFF_LINES_COPILOT_BUTTON_ID = 'diff-lines-copilot-button'

export interface DiffLinesAskCopilotButtonProps {
  fileDiffReference: FileDiffReference
  afterSelect?: () => void
}

export const DiffLinesAskCopilotButton = ({fileDiffReference, afterSelect}: DiffLinesAskCopilotButtonProps) => {
  const handleDiscuss = () => {
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      references: [fileDiffReference],
      id: DIFF_LINES_COPILOT_BUTTON_ID,
    })
    sendEvent('copilot.file-diff.discuss')
    afterSelect?.()
  }

  return (
    <AskCopilotButton
      referenceType={fileDiffReference.type}
      onClick={handleDiscuss}
      id={DIFF_LINES_COPILOT_BUTTON_ID}
    />
  )
}
