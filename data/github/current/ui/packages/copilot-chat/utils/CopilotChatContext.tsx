import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import type {PropsWithChildren} from 'react'
import {createContext, useContext, useReducer} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'

import {isRepository} from './copilot-chat-helpers'
import type {CopilotChatAction, CopilotChatState} from './copilot-chat-reducer'
import {copilotChatReducer} from './copilot-chat-reducer'
import type {
  CopilotChatAgent,
  CopilotChatMessage,
  CopilotChatMode,
  CopilotChatOrg,
  CopilotChatReference,
  CopilotChatRepo,
  CopilotChatThread,
  Docset,
} from './copilot-chat-types'
import {CopilotChatAutocompleteProvider} from './CopilotChatAutocompleteContext'
import {CopilotChatManagerProvider} from './CopilotChatManagerContext'

export const CopilotChatContext = createContext<CopilotChatState | null>(null)
export const ChatPanelReferenceContext = createContext<React.RefObject<HTMLDivElement> | null>(null)
const CopilotChatDispatchContext = createContext<React.Dispatch<CopilotChatAction> | null>(null)

export interface CopilotChatProviderProps {
  apiURL: string
  login: string
  topic?: CopilotChatRepo | Docset
  threadId: string | null
  workerPath: string
  refs: CopilotChatReference[]
  selectedReference?: CopilotChatReference | null
  mode: CopilotChatMode
  ssoOrganizations: CopilotChatOrg[]
  renderKnowledgeBases?: boolean
  renderAttachKnowledgeBaseHerePopover?: boolean
  renderKnowledgeBaseAttachedToChatPopover?: boolean
  customInstructions?: string
  chatVisibleSetting?: boolean
  chatVisibleSettingPath?: string
  agentsPath: string
  optedInToUserFeedback: boolean
  agents?: CopilotChatAgent[]
  messages?: CopilotChatMessage[]
  testReducerState?: CopilotChatState
  reviewLab: boolean
}

export function CopilotChatProvider({
  children,
  topic,
  login,
  apiURL,
  workerPath,
  threadId,
  refs,
  selectedReference,
  mode,
  ssoOrganizations,
  renderKnowledgeBases,
  renderAttachKnowledgeBaseHerePopover,
  renderKnowledgeBaseAttachedToChatPopover,
  customInstructions,
  chatVisibleSetting,
  chatVisibleSettingPath,
  agentsPath,
  optedInToUserFeedback,
  agents,
  messages,
  testReducerState,
  reviewLab,
}: PropsWithChildren<CopilotChatProviderProps>) {
  const initialState = testReducerState || {
    threadsLoading: {state: 'pending', error: null},
    messagesLoading: {state: 'pending', error: null},
    slashCommandLoading: {state: 'pending', error: null},
    showTopicPicker: (!threadId || mode === 'assistive') && !topic,
    topicLoading: {state: 'pending', error: null},
    threads: new Map<string, CopilotChatThread>(),
    knowledgeBasesLoading: {state: 'pending', error: null},
    knowledgeBases: [],
    messages: messages ?? [],
    streamer: null,
    streamingMessage: null,
    selectedThreadID: threadId,
    currentTopic: topic,
    chatIsOpen: false,
    chatIsCollapsed: mode === 'assistive',
    isWaitingOnCopilot: false,
    currentUserLogin: login,
    apiUrl: apiURL,
    currentReferences: refs,
    findFileWorkerPath: workerPath,
    threadActionMenuIsOpened: false,
    currentView: 'thread',
    selectedReference: selectedReference ?? null,
    mode,
    currentRepository: isRepository(topic) ? topic : undefined,
    ssoOrganizations,
    context: undefined,
    renderKnowledgeBases: renderKnowledgeBases ?? true,
    renderAttachKnowledgeBaseHerePopover,
    renderKnowledgeBaseAttachedToChatPopover,
    customInstructions,
    chatVisibleSetting,
    chatVisibleSettingPath,
    topRepositoriesCache: undefined,
    agentsPath,
    optedInToUserFeedback,
    agents,
    suggestionsDismissed: false,
    reviewLab,
  }

  const [state, dispatch] = useReducer(copilotChatReducer, initialState)

  const environment = relayEnvironmentWithMissingFieldHandlerForNode()

  return (
    <CopilotChatContext.Provider value={state}>
      <CopilotChatDispatchContext.Provider value={dispatch}>
        <CopilotChatManagerProvider
          apiURL={apiURL}
          state={state}
          dispatch={dispatch}
          ssoOrganizations={ssoOrganizations}
        >
          <CopilotChatAutocompleteProvider>
            <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>
          </CopilotChatAutocompleteProvider>
        </CopilotChatManagerProvider>
      </CopilotChatDispatchContext.Provider>
    </CopilotChatContext.Provider>
  )
}

export function useChatState() {
  return useContext(CopilotChatContext)!
}

export function useChatDispatch() {
  return useContext(CopilotChatDispatchContext)!
}

export function useChatPanelReferenceContext() {
  return useContext(ChatPanelReferenceContext)!
}
