import {Chat} from '@github-ui/copilot-chat/Chat'
import {CopilotChatProvider, useChatState} from '@github-ui/copilot-chat/CopilotChatContext'
import {useChatManager} from '@github-ui/copilot-chat/CopilotChatManagerContext'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useEffect} from 'react'

import {Layout} from '../components/Layout'
import {Unlicensed} from '../components/Unlicensed'
import type {CopilotImmersivePayload, CopilotImmersiveUnlicensedPayload} from './payloads'

export function CopilotImmersive() {
  const payload = useRoutePayload<CopilotImmersivePayload | CopilotImmersiveUnlicensedPayload>()
  if (payload.licensed) {
    return (
      <CopilotImmersiveProviders>
        <Immersive />
      </CopilotImmersiveProviders>
    )
  } else {
    return <Unlicensed />
  }
}

const queryClient = new QueryClient()

function CopilotImmersiveProviders({children}: React.PropsWithChildren<unknown>) {
  const payload = useRoutePayload<CopilotImmersivePayload>()

  return (
    <ScreenSizeProvider>
      <QueryClientProvider client={queryClient}>
        <CopilotChatProvider
          login={payload.currentUserLogin}
          apiURL={payload.apiURL}
          workerPath={payload.searchWorkerFilePath}
          threadId={payload.threadID}
          refs={[]}
          mode="immersive"
          topic={payload.requestedTopic}
          ssoOrganizations={payload.ssoOrganizations}
          renderKnowledgeBases={payload.renderKnowledgeBases}
          renderAttachKnowledgeBaseHerePopover={payload.renderAttachKnowledgeBaseHerePopover}
          renderKnowledgeBaseAttachedToChatPopover={payload.renderKnowledgeBaseAttachedToChatPopover}
          customInstructions={payload.customInstructions}
          agentsPath={payload.agentsPath}
          optedInToUserFeedback={payload.optedInToUserFeedback}
          reviewLab={payload.reviewLab}
        >
          {children}
        </CopilotChatProvider>
      </QueryClientProvider>
    </ScreenSizeProvider>
  )
}

function Immersive() {
  const state = useChatState()
  const manager = useChatManager()
  const {selectedThreadID} = state
  useEffect(() => {
    void manager.fetchMessages(selectedThreadID)
    // NOTE: we only want to fetch messages on the initial page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onPopState = () => {
      if (window.location.href.includes('/r/')) {
        // the browser back/forward button was used to nav to a repo topic url
        // hide the topic picker and clear the selected thread.
        manager.showTopicPicker(false)
        void manager.selectThread(null)
      } else if (!window.location.href.includes('/c/')) {
        // the browser back/forward button was used to nav to immersive landing page
        // show the topic picker and clear the selected thread.
        manager.showTopicPicker(true)
        void manager.selectThread(null)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [manager])

  return <Layout chat={<Chat key={state.selectedThreadID} />} />
}
