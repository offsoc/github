import {isFeatureEnabled} from '@github-ui/feature-flags'
import {sendEvent, stringifyObjectValues} from '@github-ui/hydro-analytics'
import {ssrSafeWindow} from '@github-ui/ssr-utils'

import {findAuthor, isDocset, referenceArraysAreEqual, referencesAreEqual} from './copilot-chat-helpers'
import type {CopilotChatMessageStreamer} from './copilot-chat-message-streamer'
import type {
  CopilotAgentError,
  CopilotAnnotations,
  CopilotChatAgent,
  CopilotChatMessage,
  CopilotChatMode,
  CopilotChatOrg,
  CopilotChatReference,
  CopilotChatRepo,
  CopilotChatSuggestions,
  CopilotChatThread,
  Docset,
  FunctionCalledStatus,
  MessageStreamingResponseComplete,
  SkillExecution,
  TopicItem,
} from './copilot-chat-types'
import {copilotFeatureFlags} from './copilot-feature-flags'
import {copilotLocalStorage} from './copilot-local-storage'

export type LoadingStateState = 'pending' | 'loading' | 'loaded' | 'error'
type LoadingState = {
  state: LoadingStateState
  error: string | null
}
export interface CopilotChatState {
  threadsLoading: LoadingState
  messagesLoading: LoadingState
  slashCommandLoading: LoadingState
  showTopicPicker: boolean
  topicLoading: LoadingState
  threads: Map<string, CopilotChatThread>
  messages: CopilotChatMessage[]
  streamer: CopilotChatMessageStreamer | null
  streamingMessage: CopilotChatMessage | null
  selectedThreadID: string | null
  currentTopic?: CopilotChatRepo | Docset
  chatIsOpen: boolean
  chatIsCollapsed: boolean
  isWaitingOnCopilot: boolean
  currentUserLogin: string
  apiUrl: string
  currentReferences: CopilotChatReference[]
  selectedReference: CopilotChatReference | null
  findFileWorkerPath: string
  threadActionMenuIsOpened: boolean
  currentView: 'thread' | 'list'
  mode: CopilotChatMode
  currentRepository?: CopilotChatRepo
  ssoOrganizations: CopilotChatOrg[]
  context?: CopilotChatReference[]
  renderKnowledgeBases?: boolean
  renderAttachKnowledgeBaseHerePopover?: boolean
  renderKnowledgeBaseAttachedToChatPopover?: boolean
  chatVisibleSetting?: boolean
  chatVisibleSettingPath?: string
  customInstructions?: string
  topRepositoriesCache: TopicItem[] | undefined
  entryPointId?: string
  suggestions?: CopilotChatSuggestions | null
  agents?: CopilotChatAgent[]
  agentsPath?: string
  optedInToUserFeedback: boolean
  /** when set, messages default to being sent to this agent */
  defaultRecipient?: string
  allClientConfirmations?: string[]
  knowledgeBasesLoading: LoadingState
  knowledgeBases: Docset[]
  reviewLab: boolean
}

export type CopilotChatAction =
  | {type: 'OPEN_THREAD_ACTION_MENU'; open: boolean}
  | {type: 'OPEN_COPILOT_CHAT'; source: string; id?: string}
  | {type: 'CLOSE_COPILOT_CHAT'}
  | {type: 'EXPAND_COPILOT_CHAT'}
  | {type: 'COLLAPSE_COPILOT_CHAT'}
  | {type: 'MESSAGES_UPDATED'; messages?: CopilotChatMessage[]; state: LoadingStateState}
  | {type: 'SELECT_THREAD'; thread: CopilotChatThread | null}
  | {type: 'THREADS_LOADING'}
  | {type: 'THREADS_LOADING_ERROR'; message: string}
  | {type: 'HANDLE_EVENT_START'; references?: CopilotChatReference[]; id?: string}
  | {type: 'THREAD_CREATED'; thread: CopilotChatThread}
  | {type: 'WAITING_ON_COPILOT'; loading: boolean}
  | {type: 'DELETE_THREAD'; thread: CopilotChatThread}
  | {type: 'DELETE_THREAD_KEEP_SELECTION'; thread: CopilotChatThread}
  | {type: 'DELETE_THREAD_ERROR'; thread: CopilotChatThread; error: string}
  | {type: 'CLEAR_THREAD'; threadID: string}
  | {type: 'CLEAR_REFERENCES'; threadID: string}
  | {type: 'CLEAR_CURRENT_REFERENCES'}
  | {type: 'KNOWLEDGE_BASES_LOADING'}
  | {type: 'KNOWLEDGE_BASES_LOADED'; knowledgeBases: Docset[]}
  | {type: 'KNOWLEDGE_BASES_LOADING_ERROR'; message: string}
  | {type: 'THREADS_LOADED'; threads: CopilotChatThread[]}
  | {type: 'MESSAGE_ADDED'; message: CopilotChatMessage}
  | {type: 'THREAD_UPDATED'; thread: CopilotChatThread}
  | {type: 'REFERENCES_LOADED'; references: CopilotChatReference[]}
  | {type: 'ADD_REFERENCE'; reference: CopilotChatReference; source: string}
  | {type: 'REMOVE_REFERENCE'; referenceIndex: number}
  | {type: 'SLASH_COMMANDS_LOADING'}
  | {type: 'SLASH_COMMANDS_LOADED'}
  | {type: 'SLASH_COMMANDS_ERROR'}
  | {type: 'SHOW_TOPIC_PICKER'; show: boolean}
  | {type: 'CURRENT_TOPIC_UPDATED'; topic: CopilotChatRepo | Docset | undefined; state: LoadingStateState}
  | {type: 'MESSAGE_STREAMING_STARTED'; message: CopilotChatMessage; streamer: CopilotChatMessageStreamer}
  | {type: 'MESSAGE_STREAMING_TOKEN_ADDED'; token: string}
  | {
      type: 'MESSAGE_STREAMING_FUNCTION_CALLED'
      name: string
      status: FunctionCalledStatus
      arguments?: string
      errorMessage?: string
      references: CopilotChatReference[]
    }
  | {type: 'MESSAGE_STREAMING_COMPLETED'; messageResponse: MessageStreamingResponseComplete}
  | {type: 'MESSAGE_STREAMING_FAILED'}
  | {type: 'MESSAGE_STREAMING_STOPPED'; message: CopilotChatMessage | null}
  | {type: 'SELECT_REFERENCE'; reference: CopilotChatReference | null}
  | {type: 'VIEW_ALL_THREADS'}
  | {type: 'VIEW_CURRENT_THREAD'}
  | {type: 'IMPLICIT_CONTEXT_UPDATED'; context: CopilotChatReference[] | undefined}
  | {type: 'DISMISS_ATTACH_KNOWLEDGE_BASE_HERE_POPOVER'}
  | {type: 'DISMISS_KNOWLEDGE_BASE_ATTACHED_TO_CHAT_POPOVER'}
  | {type: 'SET_TOP_REPOSITORIES'; topics: TopicItem[] | undefined}
  | {type: 'SUGGESTIONS_GENERATED'; suggestions: CopilotChatSuggestions}
  | {type: 'CLEAR_SUGGESTIONS'}
  | {type: 'SET_AGENTS'; agents: CopilotChatAgent[]}
  | {
      type: 'MESSAGE_STREAMING_CONFIRMATION'
      title: string
      message: string
      confirmation: object
    }
  | {type: 'AGENT_ERROR'; error: CopilotAgentError}

export const copilotChatReducer = (state: CopilotChatState, action: CopilotChatAction): CopilotChatState => {
  const chattingAboutRepo = ssrSafeWindow!.location?.pathname?.split('/').length >= 3
  const setSelectedThreadID = (selectedThreadID: string | null): CopilotChatState => {
    if (selectedThreadID) copilotLocalStorage.selectedThreadID = selectedThreadID
    return {
      ...state,
      selectedThreadID,
      currentView: 'thread',
      showTopicPicker: selectedThreadID ? false : state.showTopicPicker,
    }
  }

  const setCurrentReferences = (currentReferences: CopilotChatReference[]): CopilotChatState => {
    copilotLocalStorage.setCurrentReferences(state.selectedThreadID, currentReferences)
    return {...state, currentReferences}
  }

  switch (action.type) {
    case 'SLASH_COMMANDS_ERROR': {
      sendEvent('copilot.slash_commands_error')
      return {
        ...state,
        slashCommandLoading: {...state.slashCommandLoading, state: 'error'},
      }
    }
    case 'SLASH_COMMANDS_LOADED': {
      sendEvent('copilot.slash_commands_loaded')
      return {
        ...state,
        slashCommandLoading: {...state.slashCommandLoading, state: 'loaded'},
      }
    }
    case 'SLASH_COMMANDS_LOADING': {
      sendEvent('copilot.slash_commands_loading')
      return {
        ...state,
        slashCommandLoading: {...state.slashCommandLoading, state: 'loading'},
      }
    }
    case 'OPEN_THREAD_ACTION_MENU':
      sendEvent('copilot.open_thread_action_menu', {open: action.open})
      return {
        ...state,
        threadActionMenuIsOpened: action.open,
      }
    case 'OPEN_COPILOT_CHAT':
      sendEvent('copilot.open_copilot_chat', {source: action.source})
      return {
        ...state,
        chatIsOpen: true,
        entryPointId: action.id,
      }
    case 'CLOSE_COPILOT_CHAT':
      sendEvent('copilot.close_copilot_chat')
      return {
        ...state,
        chatIsOpen: false,
      }
    case 'EXPAND_COPILOT_CHAT':
      sendEvent('copilot.expand_copilot_chat')
      return {
        ...state,
        chatIsCollapsed: false,
      }
    case 'COLLAPSE_COPILOT_CHAT':
      sendEvent('copilot.collapse_copilot_chat')
      return {
        ...state,
        chatIsCollapsed: true,
      }
    case 'THREAD_CREATED':
      sendEvent('copilot.thread_created', {
        ...stringifyThread(action.thread),
        count: state.threads.size + 1,
      })
      return {
        ...setSelectedThreadID(action.thread.id),
        threads: new Map(state.threads.set(action.thread.id, action.thread)),
        messages: [],
        messagesLoading: {...state.messagesLoading, state: 'loaded'},
        currentReferences: copilotLocalStorage.getCurrentReferences(action.thread.id) ?? [],
        currentTopic: chattingAboutRepo ? state.currentTopic : undefined,
        defaultRecipient: undefined,
        allClientConfirmations: [],
      }
    case 'SUGGESTIONS_GENERATED':
      return {
        ...state,
        suggestions: action.suggestions,
      }
    case 'CLEAR_SUGGESTIONS':
      return {
        ...state,
        suggestions: null,
      }
    case 'CLEAR_THREAD':
      sendEvent('copilot.clear_thread')
      return {
        ...state,
        messages: [],
        currentReferences: [],
      }
    case 'CLEAR_REFERENCES':
      sendEvent('copilot.clear_references')
      if (isFeatureEnabled('COPILOT_CHAT_CONVERSATION_INTENT_KNOWLEDGE_SEARCH_SKILL')) {
        // keep any references who have a type == 'docset'
        return {
          ...state,
          currentReferences: state.currentReferences.filter(reference => reference.type === 'docset'),
        }
      }
      return {
        ...state,
        currentReferences: [],
      }
    case 'CLEAR_CURRENT_REFERENCES':
      sendEvent('copilot.clear_references')
      return {
        ...state,
        currentReferences: [],
      }
    case 'MESSAGES_UPDATED':
      sendEvent('copilot.messages_updated', {count: action.messages?.length, loading: action.state})
      if (action.messages) {
        let defaultRecipient = state.defaultRecipient
        let allClientConfirmations = state.allClientConfirmations
        if (action.state === 'loaded' && action.messages.length > 0) {
          defaultRecipient = getDefaultRecipient(action.messages[action.messages.length - 1]!, state)
          allClientConfirmations = action.messages
            .map(
              message => message.clientConfirmations?.map(cc => JSON.stringify(Object.values(cc.confirmation).sort())),
            )
            .flat()
            .filter(Boolean) as string[]
        }
        return {
          ...state,
          defaultRecipient,
          allClientConfirmations,
          messages: action.messages,
          messagesLoading: {...state.messagesLoading, state: action.state},
        }
      } else {
        return {
          ...state,
          messagesLoading: {...state.messagesLoading, state: action.state},
        }
      }
    case 'WAITING_ON_COPILOT':
      sendEvent('copilot.waiting_on_copilot', {isWaitingOnCopilot: action.loading})
      return {
        ...state,
        isWaitingOnCopilot: action.loading,
      }
    case 'SELECT_THREAD':
      sendEvent('copilot.select_thread', {threadID: action.thread?.id})
      return {
        ...setSelectedThreadID(action.thread?.id || null),
      }
    case 'HANDLE_EVENT_START': {
      sendEvent('copilot.handle_event_start')
      const newState = action.references ? setCurrentReferences(action.references) : state
      return {
        ...newState,
        chatIsOpen: true,
        chatIsCollapsed: false,
        entryPointId: action.id,
      }
    }
    case 'THREADS_LOADING':
      sendEvent('copilot.threads_loading')
      return {
        ...state,
        threadsLoading: {...state.threadsLoading, state: 'loading'},
      }
    case 'DISMISS_ATTACH_KNOWLEDGE_BASE_HERE_POPOVER':
      sendEvent('copilot.dismiss_attach_knowledge_base_here_popover')
      return {
        ...state,
        renderAttachKnowledgeBaseHerePopover: false,
      }
    case 'DISMISS_KNOWLEDGE_BASE_ATTACHED_TO_CHAT_POPOVER':
      sendEvent('copilot.dismiss_knowledge_base_attached_to_chat_popover')
      return {
        ...state,
        renderKnowledgeBaseAttachedToChatPopover: false,
      }
    case 'KNOWLEDGE_BASES_LOADING':
      sendEvent('copilot.knowledge_bases_loading')
      return {
        ...state,
        knowledgeBasesLoading: {...state.knowledgeBasesLoading, state: 'loading'},
      }
    case 'KNOWLEDGE_BASES_LOADED':
      sendEvent('copilot.knowledge_bases_loaded', {count: action.knowledgeBases.length})
      return {
        ...state,
        knowledgeBases: action.knowledgeBases,
        knowledgeBasesLoading: {...state.knowledgeBasesLoading, state: 'loaded', error: null},
      }
    case 'KNOWLEDGE_BASES_LOADING_ERROR':
      sendEvent('copilot.knowledge_bases_loading_error', {error: action.message})
      return {
        ...state,
        knowledgeBasesLoading: {...state.knowledgeBasesLoading, state: 'error', error: action.message},
      }
    case 'THREADS_LOADED':
      sendEvent('copilot.threads_loaded', {count: action.threads.length})
      return {
        ...state,
        threadsLoading: {...state.threadsLoading, state: 'loaded'},
        threads: new Map(action.threads.map(t => [t.id, t])),
      }
    case 'THREADS_LOADING_ERROR':
      sendEvent('copilot.threads_loading_error', {error: action.message})
      return {
        ...state,
        threadsLoading: {error: action.message, state: 'error'},
      }
    case 'DELETE_THREAD_KEEP_SELECTION':
      sendEvent('copilot.thread_deleted', {
        ...stringifyThread(action.thread),
        count: state.threads.size - 1,
      })
      state.threads.delete(action.thread.id)
      return {
        ...setSelectedThreadID(null),
        threads: new Map(state.threads),
        threadsLoading: {...state.threadsLoading, state: 'loaded'},
        messages: [],
        messagesLoading: {state: 'loaded', error: null},
        currentReferences: [],
        currentView: 'list',
      }
    case 'DELETE_THREAD':
      sendEvent('copilot.thread_deleted', {
        ...stringifyThread(action.thread),
        count: state.threads.size - 1,
      })
      state.threads.delete(action.thread.id)
      return {
        ...setSelectedThreadID(null),
        threads: new Map(state.threads),
        threadsLoading: {...state.threadsLoading, state: 'loaded'},
        messages: [],
        messagesLoading: {state: 'loaded', error: null},
        currentReferences: [],
      }
    case 'DELETE_THREAD_ERROR':
      sendEvent('copilot.delete_thread_error', {...stringifyThread(action.thread), error: action.error})
      return {
        ...state,
        threadsLoading: {...state.threadsLoading, error: action.error},
        threads: new Map(state.threads.set(action.thread.id, action.thread)),
      }
    case 'MESSAGE_ADDED':
      sendEvent('copilot.message_added', {
        ...stringifyMessage(action.message),
        count: state.messages.length + 1,
      })
      return {
        ...state,
        messages: [...state.messages, action.message],
      }
    case 'THREAD_UPDATED':
      sendEvent('copilot.thread_updated', stringifyThread(action.thread))
      return {
        ...state,
        ...setSelectedThreadID(action.thread.id),
        threads: new Map(state.threads.set(action.thread.id, action.thread)),
      }
    case 'REFERENCES_LOADED':
      sendEvent('copilot.references_loaded', {count: action.references.length})
      return {
        ...state,
        currentReferences: action.references,
      }
    case 'ADD_REFERENCE':
      sendEvent('copilot.add_reference', {
        ...stringifyReference(action.reference),
        source: action.source,
        count: state.currentReferences.length + 1,
      })
      return {
        ...state,
        ...setCurrentReferences([
          ...state.currentReferences.filter(reference => !referencesAreEqual(reference, action.reference)),
          action.reference,
        ]),
      }
    case 'REMOVE_REFERENCE': {
      const reference = state.currentReferences[action.referenceIndex]
      if (reference) {
        sendEvent('copilot.remove_reference', {
          ...stringifyReference(reference),
          count: state.currentReferences.length - 1,
        })
      }
      return {
        ...setCurrentReferences(state.currentReferences.filter((_, i) => i !== action.referenceIndex)),
      }
    }
    case 'SHOW_TOPIC_PICKER':
      return {
        ...state,
        showTopicPicker: action.show,
      }
    case 'CURRENT_TOPIC_UPDATED':
      if (action.topic) {
        sendEvent('copilot.current_topic_updated', {
          type: !action.topic ? 'none' : isDocset(action.topic) ? 'docset' : 'repository',
        })
      }
      return {
        ...state,
        currentTopic: action.topic,
        topicLoading: {...state.topicLoading, state: action.state},
      }
    case 'MESSAGE_STREAMING_STARTED':
      sendEvent('copilot.message_streaming_started', {
        ...stringifyMessage(action.message),
        count: state.messages.length,
      })
      return {
        ...state,
        isWaitingOnCopilot: true,
        streamer: action.streamer,
        streamingMessage: action.message,
        messages: [...state.messages],
      }
    case 'MESSAGE_STREAMING_TOKEN_ADDED':
      return {
        ...state,
        streamingMessage: state.streamingMessage
          ? {...state.streamingMessage, content: state.streamingMessage.content + action.token}
          : null,
      }
    case 'MESSAGE_STREAMING_FUNCTION_CALLED':
      if (state.streamingMessage) {
        const prevExecutions = state.streamingMessage.skillExecutions || []
        const firstStartedIdx = prevExecutions.findIndex(fc => fc.status === 'started')
        const firstStartedExecution = firstStartedIdx >= 0 ? prevExecutions[firstStartedIdx] : null

        // Default to the previous executions if somehow we don't hit our expected conditions in the switch statement
        let executions = prevExecutions

        switch (action.status) {
          // If status is started, append to skillExecutions
          case 'started':
            executions = [
              ...prevExecutions,
              {
                slug: action.name,
                status: action.status,
                arguments: action.arguments,
                errorMessage: action.errorMessage,
                references: [],
              },
            ]
            break
          case 'completed':
            // Mark the first matching started execution as completed, and update its references.
            if (firstStartedExecution) {
              executions[firstStartedIdx] = {
                ...firstStartedExecution,
                status: action.status,
                references: action.references,
              }
            }
            break
          case 'error':
            // Mark the first matching started execution as errored.
            if (firstStartedExecution) {
              executions[firstStartedIdx] = {
                ...firstStartedExecution,
                status: action.status,
                errorMessage: action.errorMessage,
              }
            }
            break
        }

        return {
          ...state,
          streamingMessage: {
            ...state.streamingMessage,
            skillExecutions: executions,
          },
        }
      }
      return state
    case 'MESSAGE_STREAMING_COMPLETED': {
      let defaultRecipient = state.defaultRecipient
      let newMessage: CopilotChatMessage | undefined
      if (state.streamingMessage) {
        newMessage = {
          ...state.streamingMessage,
          id: action.messageResponse.id,
          references: action.messageResponse.references,
          createdAt: action.messageResponse.createdAt,
          intent: action.messageResponse.intent,
          copilotAnnotations: action.messageResponse.copilotAnnotations,
        }
        defaultRecipient = getDefaultRecipient(newMessage, state)
        sendEvent('copilot.message_streaming_completed', {
          ...stringifyMessage(newMessage),
          count: state.messages.length + 1,
        })
      }
      return {
        ...state,
        defaultRecipient,
        isWaitingOnCopilot: false,
        streamer: null,
        streamingMessage: null,
        messages: newMessage ? [...state.messages, newMessage] : state.messages,
      }
    }
    case 'MESSAGE_STREAMING_FAILED':
      sendEvent('copilot.message_streaming_failed')
      return {
        ...state,
        isWaitingOnCopilot: false,
        streamer: null,
        streamingMessage: null,
      }
    case 'MESSAGE_STREAMING_STOPPED': {
      let newMessage: CopilotChatMessage | undefined
      if (state.streamingMessage) {
        newMessage = {
          ...state.streamingMessage,
          interrupted: true,
        }
        sendEvent('copilot.message_streaming_stopped', {
          ...stringifyMessage(newMessage),
          count: state.messages.length + 1,
        })
      }
      return {
        ...state,
        isWaitingOnCopilot: false,
        streamer: null,
        streamingMessage: null,
        messages: newMessage ? [...state.messages, newMessage] : state.messages,
      }
    }
    case 'SELECT_REFERENCE':
      if (action.reference) {
        sendEvent('copilot.select_reference', stringifyReference(action.reference))
      }
      return {
        ...state,
        selectedReference: action.reference,
      }
    case 'VIEW_ALL_THREADS':
      return {
        ...state,
        currentView: 'list',
      }
    case 'VIEW_CURRENT_THREAD':
      return {
        ...state,
        currentView: 'thread',
      }
    case 'IMPLICIT_CONTEXT_UPDATED':
      if (!referenceArraysAreEqual(action.context, state.context)) {
        return {
          ...state,
          context: action.context,
        }
      }
      return state
    case 'SET_TOP_REPOSITORIES':
      return {
        ...state,
        topRepositoriesCache: action.topics,
      }
    case 'SET_AGENTS':
      return {
        ...state,
        agents: action.agents,
      }
    case 'MESSAGE_STREAMING_CONFIRMATION': {
      const confirmation = {
        title: action.title,
        message: action.message,
        confirmation: action.confirmation,
      }
      return {
        ...state,
        streamingMessage: state.streamingMessage
          ? {
              ...state.streamingMessage,
              confirmations: state.streamingMessage.confirmations
                ? [...state.streamingMessage.confirmations, confirmation]
                : [confirmation],
            }
          : null,
      }
    }
    case 'AGENT_ERROR': {
      const streamingMessage = state.streamingMessage
      const agentError = action.error

      return {
        ...state,
        streamingMessage: streamingMessage && {
          ...streamingMessage,
          agentErrors: [
            ...(streamingMessage.agentErrors ?? []),
            {
              type: agentError.type,
              code: agentError.code,
              message: agentError.message,
              identifier: agentError.identifier,
            },
          ],
        },
      }
    }
  }
}

/**
 * Stringifies the given message while cleaning sensitive information from it.
 */
function stringifyMessage(message: CopilotChatMessage) {
  if (!message) {
    return stringifyObjectValues({})
  }
  const obj: Record<string, unknown> = {
    id: message.id,
    role: message.role,
    createdAt: message.createdAt,
    threadID: message.threadID,
    referenceCount: message.references?.length ?? 0,
  }
  if (message.intent) {
    obj.intent = message.intent
  }
  if (message.error) {
    obj.error = message.error
  }
  if (message.copilotAnnotations) {
    obj.copilotAnnotations = cleanCopilotAnnotations(message.copilotAnnotations)
  }
  if (message.skillExecutions) {
    obj.skillExecutions = cleanSkillExecutions(message.skillExecutions)
  }
  if (message.interrupted) {
    obj.interrupted = true
  }
  return stringifyObjectValues(obj)
}

/**
 * Stringifies the given thread while cleaning sensitive information from it.
 */
function stringifyThread(thread: CopilotChatThread) {
  if (!thread) {
    return stringifyObjectValues({})
  }
  return stringifyObjectValues({
    id: thread.id,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    currentReferenceCount: thread.currentReferences?.length ?? 0,
  })
}

/**
 * Stringifies the given reference while cleaning sensitive information from it.
 */
function stringifyReference(reference: CopilotChatReference) {
  if (!reference) {
    return stringifyObjectValues({})
  }
  return stringifyObjectValues({
    type: reference.type,
  })
}

/**
 * Remove sensitive information from skillExecutions in preparation for logging.
 */
function cleanSkillExecutions(skillExecutions: SkillExecution[] | undefined) {
  if (!skillExecutions) {
    return []
  }
  return skillExecutions.map(execution => ({
    slug: execution?.slug,
    status: execution?.status,
    argumentCount: execution?.arguments?.length ?? 0,
    errorMessage: execution?.errorMessage,
    references: execution?.references?.length ?? 0,
  }))
}

/**
 * Remove sensitive information from copilotAnnotations in preparation for logging.
 */
function cleanCopilotAnnotations(annotations: CopilotAnnotations | undefined) {
  if (!annotations) {
    return undefined
  }
  return {
    CodeVulnerability: annotations.CodeVulnerability?.map(vuln => ({
      details: {
        type: vuln?.details?.type,
      },
    })),
  }
}

function getDefaultRecipient(message: CopilotChatMessage, state: CopilotChatState): string | undefined {
  if (!copilotFeatureFlags.followupToAgent) {
    return undefined
  }
  const author = findAuthor(message, state.currentUserLogin)
  if (author.type === 'agent') {
    return author.name
  }
}
