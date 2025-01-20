import {Chat} from '@github-ui/copilot-chat/Chat'
import {ChatPortalContainer} from '@github-ui/copilot-chat/components/PortalContainerUtils'
import {CopilotChatProvider, useChatState} from '@github-ui/copilot-chat/CopilotChatContext'
import {useChatManager} from '@github-ui/copilot-chat/CopilotChatManagerContext'
import {isThreadOlderThan4Hours} from '@github-ui/copilot-chat/utils/copilot-chat-helpers'
import type {CopilotChatManager} from '@github-ui/copilot-chat/utils/copilot-chat-manager'
import type {CopilotChatState} from '@github-ui/copilot-chat/utils/copilot-chat-reducer'
import type {CopilotChatThread} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import type {Repository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import {useEffect} from 'react'

import {getSelectedThreadID, setSelectedThreadID} from '../utilities/copilot-chat'
import type {CopilotTaskBasePayload, PullRequestData} from '../utilities/copilot-task-types'

export interface ChatContainerProps {}

export function ChatContainer(_props: ChatContainerProps) {
  const {copilot, findFileWorkerPath, pullRequest, repo} = useRoutePayload<CopilotTaskBasePayload>()
  const threadID = getSelectedThreadID(repo.ownerLogin, repo.name, pullRequest.number)
  return (
    <ScreenSizeProvider>
      <CopilotChatProvider
        topic={copilot.currentTopic}
        login={copilot.currentUserLogin}
        apiURL={copilot.apiURL}
        workerPath={findFileWorkerPath}
        threadId={threadID}
        refs={[]} // TODO
        mode="assistive"
        ssoOrganizations={copilot.ssoOrganizations}
        renderAttachKnowledgeBaseHerePopover={copilot.renderAttachKnowledgeBaseHerePopover}
        renderKnowledgeBaseAttachedToChatPopover={copilot.renderKnowledgeBaseAttachedToChatPopover}
        customInstructions={copilot.customInstructions}
        agentsPath={copilot.agentsPath}
        optedInToUserFeedback={copilot.optedInToUserFeedback}
        reviewLab={copilot.reviewLab}
      >
        <ChatPortalContainer />
        <ChatWrapper pullRequest={pullRequest} repo={repo} />
      </CopilotChatProvider>
    </ScreenSizeProvider>
  )
}

function ChatWrapper({repo, pullRequest}: {repo: Repository; pullRequest: PullRequestData}) {
  const state = useChatState()
  const manager = useChatManager()
  const {selectedThreadID} = state
  useEffect(() => {
    loadOrCreateThread(manager, state, selectedThreadID)
    // we only want to run this on the first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // synchronize the selected thread ID with local storage
  useEffect(() => {
    setSelectedThreadID(repo.ownerLogin, repo.name, pullRequest.number, selectedThreadID)
  }, [pullRequest, repo, selectedThreadID])

  return <Chat key={state.selectedThreadID} />
}

async function loadOrCreateThread(
  manager: CopilotChatManager,
  state: CopilotChatState,
  selectedThreadID: string | null,
) {
  let thread: CopilotChatThread | null = null
  if (selectedThreadID) {
    if (state.threads.has(selectedThreadID)) {
      thread = state.threads.get(selectedThreadID) ?? null
    } else {
      const threads = await manager.fetchThreads()
      thread = threads?.find(t => t.id === selectedThreadID) ?? null
    }
  }
  if (thread && isThreadOlderThan4Hours(thread)) {
    thread = null
  }

  manager.openChat(thread, 'thread', 'hadron-editor')
}
