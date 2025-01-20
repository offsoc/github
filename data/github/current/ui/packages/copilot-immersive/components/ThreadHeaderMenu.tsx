import {ThreadOptionButton} from '@github-ui/copilot-chat/components/Header'
import {useChatState} from '@github-ui/copilot-chat/CopilotChatContext'
import {useChatManager} from '@github-ui/copilot-chat/CopilotChatManagerContext'
import {COPILOT_PATH} from '@github-ui/copilot-chat/utils/copilot-chat-helpers'
import {useNavigate} from '@github-ui/use-navigate'

export interface ThreadHeaderMenuProps {
  setShowExperimentsDialog: (value: boolean) => void
}

export const ThreadHeaderMenu = (props: ThreadHeaderMenuProps) => {
  const {selectedThreadID, threads, mode} = useChatState()
  const manager = useChatManager()
  const navigate = useNavigate()

  const thread = selectedThreadID ? threads.get(selectedThreadID) : null

  const handleDelete = () => {
    if (thread) {
      void manager.deleteThread(thread)
    }

    if (mode === 'immersive') {
      navigate(COPILOT_PATH)
    }
  }

  return (
    <ThreadOptionButton
      handleDelete={handleDelete}
      setShowExperimentsDialog={props.setShowExperimentsDialog}
      thread={thread}
    />
  )
}
