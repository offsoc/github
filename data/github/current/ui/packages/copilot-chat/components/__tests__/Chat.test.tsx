import {isFeatureEnabled} from '@github-ui/feature-flags'
import {sendEvent} from '@github-ui/hydro-analytics'
import {render} from '@github-ui/react-core/test-utils'
import {QueryClient, type QueryClientConfig, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen} from '@testing-library/react'

import {
  getCopilotChatProviderProps,
  getDefaultReducerState,
  getMessageMock,
  getThreadMock,
} from '../../test-utils/mock-data'
import {CopilotChatProvider} from '../../utils/CopilotChatContext'
import {Chat} from '../Chat'

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    ...jest.requireActual('@github-ui/hydro-analytics'),
    sendEvent: jest.fn(),
  }
})

jest.mock('@github-ui/feature-flags')

function getQueryClient(overrides?: QueryClientConfig) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    ...overrides,
  })
}

test('Show suggested prompts when no topic is selected but in a thread', () => {
  setupResizeObserverMock()
  setupMatchMediaMock()
  const queryClient = getQueryClient()
  render(
    <CopilotChatProvider
      {...getCopilotChatProviderProps()}
      testReducerState={{
        ...getDefaultReducerState('2', undefined, 'immersive'),
        topicLoading: {state: 'loaded', error: null},
        messagesLoading: {state: 'loaded', error: null},
        knowledgeBasesLoading: {state: 'loaded', error: null},
        threads: new Map([['2', {...getThreadMock(), id: '2'}]]),
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Chat />
      </QueryClientProvider>
    </CopilotChatProvider>,
  )

  const button = screen.getAllByRole('button')[1]! // This fixed index is not great, but the text of the buttons is randomized.
  expect(button).toBeInTheDocument()
  fireEvent.click(button)

  const calls = (sendEvent as jest.Mock).mock.calls
  const eventIndex = calls.findIndex(call => call[0] === 'copilot_chat_suggestion_click')
  expect(eventIndex).toBeGreaterThan(-1)
  expect(calls[eventIndex][1]['content']).toBeUndefined()
})

test('Hide suggested prompts when in a thread with messages and no topic is selected', () => {
  setupResizeObserverMock()
  setupMatchMediaMock()

  const queryClient = getQueryClient()
  render(
    <CopilotChatProvider
      {...getCopilotChatProviderProps()}
      testReducerState={{
        ...getDefaultReducerState('2', undefined, 'immersive'),
        topicLoading: {state: 'loaded', error: null},
        messagesLoading: {state: 'loaded', error: null},
        knowledgeBasesLoading: {state: 'loaded', error: null},
        threads: new Map([['2', {...getThreadMock(), id: '2', messages: [getMessageMock()]}]]),
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Chat />
      </QueryClientProvider>
    </CopilotChatProvider>,
  )
  const button = screen.getAllByRole('button')[1] // This fixed index is not great, but the text of the buttons is randomized.
  expect(button).toBeDefined()
  fireEvent.click(button!)
  const suggestionButton = screen.getAllByRole('button')[6] // Skip past header buttons
  expect(suggestionButton).toBeUndefined()
})

test('Hide suggested prompts when topic is loading', () => {
  setupResizeObserverMock()
  setupMatchMediaMock()

  const queryClient = getQueryClient()
  render(
    <CopilotChatProvider
      {...getCopilotChatProviderProps()}
      testReducerState={{
        ...getDefaultReducerState('2', undefined, 'immersive'),
        topicLoading: {state: 'loading', error: null},
        messagesLoading: {state: 'loaded', error: null},
        knowledgeBasesLoading: {state: 'loaded', error: null},
        threads: new Map([['2', {...getThreadMock(), id: '2', messages: [getMessageMock()]}]]),
        renderKnowledgeBases: true,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Chat />
      </QueryClientProvider>
    </CopilotChatProvider>,
  )

  // One button is the 'All' repositories' breadcrumb, one is the 'Attach knowledge' button, the other is the 'Send now' chat button
  expect(screen.queryAllByRole('button')).toHaveLength(3)
})

test('`Ask anything:` is in the Suggestions header when messages array is empty and context is undefined', () => {
  setupResizeObserverMock()
  setupMatchMediaMock()
  ;(isFeatureEnabled as jest.Mock).mockImplementation(flag => flag === 'copilot_chat_static_thread_suggestions')

  const queryClient = getQueryClient()
  render(
    <CopilotChatProvider
      {...getCopilotChatProviderProps()}
      testReducerState={{
        ...getDefaultReducerState('2', undefined, 'assistive'),
        messagesLoading: {state: 'loaded', error: null},
        topicLoading: {state: 'loaded', error: null},
        currentReferences: [],
        suggestions: {referenceType: undefined, suggestions: [{question: 'Tell me about this repo.', skill: ''}]},
        threads: new Map([['2', {...getThreadMock(), id: '2', messages: []}]]),
        context: undefined,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Chat />
      </QueryClientProvider>
    </CopilotChatProvider>,
  )

  // Expect 'Ask anything' to be the header
  expect(screen.getByText('Ask anything:')).toBeInTheDocument()
})

function setupResizeObserverMock() {
  class MockResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  })
}

function setupMatchMediaMock() {
  /**
   * Duplicated from ui/packages/jest/jest-setup.ts
   * this is not implemented in JSDOM, and until it is we'll need to polyfill
   */
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    }),
  })
}
