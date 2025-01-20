import {isFeatureEnabled} from '@github-ui/feature-flags'
import {sendEvent} from '@github-ui/hydro-analytics'

import {
  getDocsetMock,
  getMessageMock,
  getMessageStreamingResponseMock,
  getReducerStateMock,
  getRepositoryMock,
  getRepositoryReferenceMock,
  getSnippetReferenceMock,
  getThreadMock,
} from '../../test-utils/mock-data'
import {MockReader} from '../../test-utils/mock-reader'
import {CopilotChatMessageStreamer} from '../copilot-chat-message-streamer'
import type {CopilotChatAction} from '../copilot-chat-reducer'
import {copilotChatReducer} from '../copilot-chat-reducer'

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    ...jest.requireActual('@github-ui/hydro-analytics'),
    sendEvent: jest.fn((type: string, context?: Record<string, string | number | boolean | null | undefined>) => {
      // try to catch logging messages
      if (context?.content !== undefined) {
        throw new Error('Content should not be logged. Are you logging a message?')
      }
      // try to catch logging references
      if (context?.repoOwner || context?.ownerLogin) {
        throw new Error('References should not be logged. Are you logging a reference?')
      }
      // try to catch logging threads
      if (context?.currentReferences) {
        throw new Error('Threads should not be logged. Are you logging a thread?')
      }
    }),
  }
})

jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled: jest.fn(),
}))

const mockIsFeatureEnabled = jest.mocked(isFeatureEnabled)

beforeEach(() => {
  jest.clearAllMocks()
})

test('Slash commands error', () => {
  const action: CopilotChatAction = {type: 'SLASH_COMMANDS_ERROR'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.slashCommandLoading.state).toBe('error')
  expect(sendEvent).toHaveBeenCalledWith('copilot.slash_commands_error')
})

test('Slash commands loaded', () => {
  const action: CopilotChatAction = {type: 'SLASH_COMMANDS_LOADED'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.slashCommandLoading.state).toBe('loaded')
  expect(sendEvent).toHaveBeenCalledWith('copilot.slash_commands_loaded')
})

test('Slash commands loading', () => {
  const action: CopilotChatAction = {type: 'SLASH_COMMANDS_LOADING'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.slashCommandLoading.state).toBe('loading')
  expect(sendEvent).toHaveBeenCalledWith('copilot.slash_commands_loading')
})

test('Open thread action menu', () => {
  const action: CopilotChatAction = {type: 'OPEN_THREAD_ACTION_MENU', open: true}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threadActionMenuIsOpened).toBe(true)
  expect(sendEvent).toHaveBeenCalledWith('copilot.open_thread_action_menu', {open: true})
})

test('Open copilot chat', () => {
  const action: CopilotChatAction = {type: 'OPEN_COPILOT_CHAT', source: 'test'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.chatIsOpen).toBe(true)
  expect(sendEvent).toHaveBeenCalledWith('copilot.open_copilot_chat', {source: 'test'})
})

test('Close copilot chat', () => {
  const action: CopilotChatAction = {type: 'CLOSE_COPILOT_CHAT'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.chatIsOpen).toBe(false)
  expect(sendEvent).toHaveBeenCalledWith('copilot.close_copilot_chat')
})

test('Adds a thread', () => {
  const thread = getThreadMock()
  const action: CopilotChatAction = {type: 'THREAD_CREATED', thread}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threads.size).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.thread_created', {
    count: 1,
    createdAt: '"2020-01-01T00:00:00Z"',
    currentReferenceCount: '0',
    id: '"0"',
    updatedAt: '"2020-01-01T00:00:00Z"',
  })
})

test('Clear thread', () => {
  const action: CopilotChatAction = {type: 'CLEAR_THREAD', threadID: '0'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threads.size).toBe(0)
  expect(sendEvent).toHaveBeenCalledWith('copilot.clear_thread')
})

test('Dismiss "attach knowledge base here" popover', () => {
  const action: CopilotChatAction = {type: 'DISMISS_ATTACH_KNOWLEDGE_BASE_HERE_POPOVER'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.renderAttachKnowledgeBaseHerePopover).toBe(false)
  expect(sendEvent).toHaveBeenCalledWith('copilot.dismiss_attach_knowledge_base_here_popover')
})

test('Dismiss "knowledge base attached to chat" popover', () => {
  const action: CopilotChatAction = {type: 'DISMISS_KNOWLEDGE_BASE_ATTACHED_TO_CHAT_POPOVER'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.renderKnowledgeBaseAttachedToChatPopover).toBe(false)
  expect(sendEvent).toHaveBeenCalledWith('copilot.dismiss_knowledge_base_attached_to_chat_popover')
})

test('Messages updated', () => {
  const action: CopilotChatAction = {type: 'MESSAGES_UPDATED', messages: [getMessageMock()], state: 'loaded'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.messages.length).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.messages_updated', {
    count: 1,
    loading: 'loaded',
  })
})

test('Waiting on copilot', () => {
  const action: CopilotChatAction = {type: 'WAITING_ON_COPILOT', loading: true}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.isWaitingOnCopilot).toBe(true)
  expect(sendEvent).toHaveBeenCalledWith('copilot.waiting_on_copilot', {isWaitingOnCopilot: true})
})

test('Select thread', () => {
  const action: CopilotChatAction = {type: 'SELECT_THREAD', thread: getThreadMock()}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.selectedThreadID).toBe('0')
  expect(sendEvent).toHaveBeenCalledWith('copilot.select_thread', {threadID: '0'})
})

test('Handle event start', () => {
  const action: CopilotChatAction = {type: 'HANDLE_EVENT_START', references: [getRepositoryReferenceMock()]}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.currentReferences.length).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.handle_event_start')
})

test('Threads loading', () => {
  const action: CopilotChatAction = {type: 'THREADS_LOADING'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threadsLoading.state).toBe('loading')
  expect(sendEvent).toHaveBeenCalledWith('copilot.threads_loading')
})

test('Threads loaded', () => {
  const action: CopilotChatAction = {type: 'THREADS_LOADED', threads: [getThreadMock()]}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threadsLoading.state).toBe('loaded')
  expect(sendEvent).toHaveBeenCalledWith('copilot.threads_loaded', {count: 1})
})

test('Threads loading error', () => {
  const action: CopilotChatAction = {type: 'THREADS_LOADING_ERROR', message: 'error'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threadsLoading.state).toBe('error')
  expect(sendEvent).toHaveBeenCalledWith('copilot.threads_loading_error', {error: 'error'})
})

test('Delete thread', () => {
  const thread = getThreadMock()
  const threads = new Map()
  threads.set(thread.id, thread)
  const action: CopilotChatAction = {type: 'DELETE_THREAD', thread}
  const state = copilotChatReducer({...getReducerStateMock(), threads}, action)
  expect(state.threads.size).toBe(0)
  expect(sendEvent).toHaveBeenCalledWith('copilot.thread_deleted', {
    count: 0,
    createdAt: '"2020-01-01T00:00:00Z"',
    currentReferenceCount: '0',
    id: '"0"',
    updatedAt: '"2020-01-01T00:00:00Z"',
  })
})

test('Delete thread error', () => {
  const action: CopilotChatAction = {type: 'DELETE_THREAD_ERROR', thread: getThreadMock(), error: 'error'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threadsLoading.error).toBe('error')
  expect(sendEvent).toHaveBeenCalledWith('copilot.delete_thread_error', {
    createdAt: '"2020-01-01T00:00:00Z"',
    currentReferenceCount: '0',
    id: '"0"',
    updatedAt: '"2020-01-01T00:00:00Z"',
    error: 'error',
  })
})

test('Adds a message', () => {
  const message = getMessageMock()
  const action: CopilotChatAction = {type: 'MESSAGE_ADDED', message}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.messages.length).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.message_added', {
    count: 1,
    id: '"0"',
    role: '"user"',
    createdAt: '"2020-01-01T00:00:00Z"',
    threadID: '"0"',
    referenceCount: '0',
  })
})

test('Thread updated', () => {
  const thread = getThreadMock()
  const action: CopilotChatAction = {type: 'THREAD_UPDATED', thread}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.threads.size).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.thread_updated', {
    createdAt: '"2020-01-01T00:00:00Z"',
    currentReferenceCount: '0',
    id: '"0"',
    updatedAt: '"2020-01-01T00:00:00Z"',
  })
})

test('References loaded', () => {
  const action: CopilotChatAction = {type: 'REFERENCES_LOADED', references: [getRepositoryReferenceMock()]}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.currentReferences.length).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.references_loaded', {count: 1})
})

test('Adds a reference', () => {
  const reference = getRepositoryReferenceMock()
  const action: CopilotChatAction = {type: 'ADD_REFERENCE', reference, source: 'source'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.currentReferences.length).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.add_reference', {
    count: 1,
    source: 'source',
    type: '"repository"',
  })
})

test('Removes a reference', () => {
  const reference = getRepositoryReferenceMock()
  const action: CopilotChatAction = {type: 'REMOVE_REFERENCE', referenceIndex: 0}
  const state = copilotChatReducer({...getReducerStateMock(), currentReferences: [reference]}, action)
  expect(state.currentReferences.length).toBe(0)
  expect(sendEvent).toHaveBeenCalledWith('copilot.remove_reference', {
    count: 0,
    type: '"repository"',
  })
})

test('Current topic updated', () => {
  const action: CopilotChatAction = {type: 'CURRENT_TOPIC_UPDATED', topic: getRepositoryMock(), state: 'loaded'}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.currentTopic).toStrictEqual(getRepositoryMock())
  expect(sendEvent).toHaveBeenCalledWith('copilot.current_topic_updated', {
    type: 'repository',
  })
})

test('Message streaming started', () => {
  const streamer = new CopilotChatMessageStreamer(new MockReader([]))
  const action: CopilotChatAction = {type: 'MESSAGE_STREAMING_STARTED', message: getMessageMock(), streamer}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.isWaitingOnCopilot).toBe(true)
  expect(state.streamingMessage).toEqual(getMessageMock())
  expect(sendEvent).toHaveBeenCalledWith('copilot.message_streaming_started', {
    count: 0,
    id: '"0"',
    role: '"user"',
    createdAt: '"2020-01-01T00:00:00Z"',
    threadID: '"0"',
    referenceCount: '0',
  })
})

test('Message streaming token added', () => {
  const action: CopilotChatAction = {type: 'MESSAGE_STREAMING_TOKEN_ADDED', token: 'token'}
  const state = copilotChatReducer({...getReducerStateMock(), streamingMessage: getMessageMock()}, action)
  expect(state.streamingMessage?.content).toBe('contenttoken')
})

test('Message streaming complete', () => {
  const action: CopilotChatAction = {
    type: 'MESSAGE_STREAMING_COMPLETED',
    messageResponse: getMessageStreamingResponseMock(),
  }
  const streamer = new CopilotChatMessageStreamer(new MockReader([]))
  const state = copilotChatReducer({...getReducerStateMock(), streamingMessage: getMessageMock(), streamer}, action)
  expect(state.streamer).toBeNull()
  expect(state.streamingMessage).toBeNull()
  expect(state.messages.length).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.message_streaming_completed', {
    count: 1,
    id: '"0"',
    intent: '"conversation"',
    role: '"user"',
    createdAt: '"2020-01-01T00:00:00Z"',
    threadID: '"0"',
    referenceCount: '0',
  })
})

test('Message streaming failed', () => {
  const action: CopilotChatAction = {type: 'MESSAGE_STREAMING_FAILED'}
  const streamer = new CopilotChatMessageStreamer(new MockReader([]))
  const state = copilotChatReducer({...getReducerStateMock(), streamingMessage: getMessageMock(), streamer}, action)
  expect(state.streamer).toBeNull()
  expect(state.streamingMessage).toBeNull()
  expect(sendEvent).toHaveBeenCalledWith('copilot.message_streaming_failed')
})

test('Message streaming stopped', () => {
  const message = getMessageMock()
  const action: CopilotChatAction = {type: 'MESSAGE_STREAMING_STOPPED', message}
  const streamer = new CopilotChatMessageStreamer(new MockReader([]))
  const state = copilotChatReducer({...getReducerStateMock(), streamingMessage: message, streamer}, action)
  expect(state.isWaitingOnCopilot).toBeFalsy()
  expect(state.streamer).toBeNull()
  expect(state.streamingMessage).toBeNull()
  expect(state.messages.length).toBe(1)
  expect(sendEvent).toHaveBeenCalledWith('copilot.message_streaming_stopped', {
    count: 1,
    id: '"0"',
    role: '"user"',
    createdAt: '"2020-01-01T00:00:00Z"',
    threadID: '"0"',
    referenceCount: '0',
    interrupted: 'true',
  })
})

test('Select reference', () => {
  const action: CopilotChatAction = {type: 'SELECT_REFERENCE', reference: getRepositoryReferenceMock()}
  const state = copilotChatReducer(getReducerStateMock(), action)
  expect(state.selectedReference).toStrictEqual(getRepositoryReferenceMock())
  expect(sendEvent).toHaveBeenCalledWith('copilot.select_reference', {
    type: '"repository"',
  })
})

describe('Clear references', () => {
  test('Clears all references', () => {
    const action: CopilotChatAction = {type: 'CLEAR_REFERENCES', threadID: '0'}
    const stateWithReferences = {
      ...getReducerStateMock(),
      currentReferences: [getRepositoryReferenceMock(), getSnippetReferenceMock()],
    }
    const state = copilotChatReducer(stateWithReferences, action)
    expect(state.currentReferences.length).toBe(0)
    expect(sendEvent).toHaveBeenCalledWith('copilot.clear_references')
  })

  test('leaves knowledge base references when FF is enabled', () => {
    const action: CopilotChatAction = {type: 'CLEAR_REFERENCES', threadID: '0'}
    const docsetReference = {...getDocsetMock(), type: 'docset' as const}
    const stateWithReferences = {
      ...getReducerStateMock(),
      currentReferences: [getRepositoryReferenceMock(), getSnippetReferenceMock(), docsetReference],
    }

    mockIsFeatureEnabled.mockReturnValue(true)
    const state = copilotChatReducer(stateWithReferences, action)
    expect(state.currentReferences.length).toBe(1)
    expect(state.currentReferences[0]).toStrictEqual(docsetReference)
    expect(sendEvent).toHaveBeenCalledWith('copilot.clear_references')
  })
})
