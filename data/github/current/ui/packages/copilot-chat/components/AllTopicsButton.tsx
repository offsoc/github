import {ArrowLeftIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'

import {navigateToAllTopics} from '../utils/copilot-chat-helpers'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'

export default function AllTopicsButton() {
  const {mode} = useChatState()
  const manager = useChatManager()

  return (
    <Button
      leadingVisual={ArrowLeftIcon}
      variant="invisible"
      onClick={() => navigateToAllTopics(manager.showTopicPicker, mode)}
      sx={{
        color: 'fg.muted',
        marginLeft: mode === 'assistive' ? '-8px' : undefined,
      }}
    >
      All repositories
    </Button>
  )
}
