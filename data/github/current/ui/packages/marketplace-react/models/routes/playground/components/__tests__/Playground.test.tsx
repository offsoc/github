import safeStorage from '@github-ui/safe-storage'
import {Playground} from '../Playground'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'
import type {Model, ModelInputSchema} from '../../../../../types'
import type {ShowModelGettingStartedPayloadLanguageEntry} from '../GettingStartedDialog/types'
import type {PlaygroundMessage} from '../../../../utils/model-client'
import React, {useReducer} from 'react'
import {
  tasksReducer,
  initialPlaygroundState,
  PlaygroundManager,
  PlaygroundStateContext,
  PlaygroundManagerContext,
  PlaygroundStateDispatcherContext,
} from '../../../../utils/playground-manager'

const mockStoredMessage = {
  role: 'user',
  message: 'test message',
  timestamp: new Date('2024-01-01T00:00:00+00:00'),
} satisfies PlaygroundMessage

const mockModel = {
  id: '',
  registry: '',
  name: 'test',
  original_name: 'test',
  friendly_name: '',
  publisher: '',
  task: '',
  description: '',
  summary: '',
  license: '',
  logo_url: '',
  samples: {
    code: {
      rest: {
        friendly_name: 'curl',
        sdks: {
          curl: {
            friendly_name: 'curl',
            code: '',
          },
          'azure-ai-inference': {
            friendly_name: 'azure',
            code: '',
          },
        },
      },
      js: {
        friendly_name: 'curl',
        sdks: {
          curl: {
            friendly_name: 'curl',
            code: '',
          },
          'azure-ai-inference': {
            friendly_name: 'azure',
            code: '',
          },
        },
      },
      python: {
        friendly_name: 'curl',
        sdks: {
          curl: {
            friendly_name: 'curl',
            code: '',
          },
          'azure-ai-inference': {
            friendly_name: 'azure',
            code: '',
          },
        },
      },
    },
    inputs: [{messages: [{content: 'sample message'}]}],
  },
  tags: [],
  rate_limit_tier: '',
  supported_languages: [''],
  max_output_tokens: 100,
  max_input_tokens: 100,
  training_data_date: '',
  model_family: '',
  evaluation: '',
  notes: '',
} satisfies Model

const mockModelInputSchema = {
  examples: [],
  sampleInputs: [{messages: [{content: 'sample message'}]}],
  inputs: [],
  outputs: [],
  fixedParameters: [],
  capabilities: {},
  type: '',
  version: '',
  behavior: '',
  parameters: [],
}

const mockGettingStarted: Record<string, ShowModelGettingStartedPayloadLanguageEntry> = {
  python: {
    name: 'Python',
    sdks: {
      'azure-ai-inference': {
        name: 'Azure AI Inference SDK',
        tocHeadings: [],
        content: '',
        codeSamples: '',
      },
    },
  },
}

const mockLocalStorage = {
  modelName: 'test',
  messages: [mockStoredMessage],
}

const PlaygroundWrapper = ({
  model,
  modelInputSchema,
  gettingStarted,
  children,
}: {
  model: Model
  modelInputSchema: ModelInputSchema
  gettingStarted: Record<string, ShowModelGettingStartedPayloadLanguageEntry>
  children: React.ReactNode
}) => {
  const playgroundUrl = ''
  const [playgroundState, playgroundDispatch] = useReducer(tasksReducer, initialPlaygroundState)

  // Ensure PlaygroundManager is not recreated on every render
  const manager = React.useMemo(
    () => new PlaygroundManager(playgroundDispatch, model, playgroundUrl, modelInputSchema, gettingStarted),
    [playgroundDispatch, model, playgroundUrl, modelInputSchema, gettingStarted],
  )

  return (
    <PlaygroundStateContext.Provider value={playgroundState}>
      <PlaygroundManagerContext.Provider value={manager}>
        <PlaygroundStateDispatcherContext.Provider value={playgroundDispatch}>
          {children}
        </PlaygroundStateDispatcherContext.Provider>
      </PlaygroundManagerContext.Provider>
    </PlaygroundStateContext.Provider>
  )
}

describe('Playground', () => {
  const safeLocalStorage = safeStorage('localStorage')
  afterEach(() => {
    safeLocalStorage.removeItem('playground-chat-messages')
  })

  test('displays no messages when page is loaded', () => {
    render(
      <PlaygroundWrapper model={mockModel} modelInputSchema={mockModelInputSchema} gettingStarted={mockGettingStarted}>
        <Playground />
      </PlaygroundWrapper>,
    )

    expect(screen.queryByTestId('playground-chat-message')).not.toBeInTheDocument()
  })

  test('displays the restore chat history button when there are messages stored in the local storage', () => {
    safeLocalStorage.setItem('playground-chat-messages', JSON.stringify(mockLocalStorage))
    render(
      <PlaygroundWrapper model={mockModel} modelInputSchema={mockModelInputSchema} gettingStarted={mockGettingStarted}>
        <Playground />
      </PlaygroundWrapper>,
    )

    expect(screen.getByTestId('restore-history-button')).toBeInTheDocument()
    expect(screen.queryByText('Reset chat history')).not.toBeInTheDocument()
  })

  test('does not display the restore chat history button when there are no messages stored in the local storage', async () => {
    render(
      <PlaygroundWrapper model={mockModel} modelInputSchema={mockModelInputSchema} gettingStarted={mockGettingStarted}>
        <Playground />
      </PlaygroundWrapper>,
    )

    expect(screen.queryByTestId('restore-history-button')).not.toBeInTheDocument()
  })

  test('displays the reset chat history button when messages are restored from the local storage', () => {
    safeLocalStorage.setItem('playground-chat-messages', JSON.stringify(mockLocalStorage))
    render(
      <PlaygroundWrapper model={mockModel} modelInputSchema={mockModelInputSchema} gettingStarted={mockGettingStarted}>
        <Playground />
      </PlaygroundWrapper>,
    )

    const restoreButton = screen.getByRole('button', {name: 'Restore last session'})
    fireEvent.click(restoreButton)
    expect(screen.getByLabelText('Reset chat history')).toBeInTheDocument()
    expect(screen.queryByTestId('restore-history-button')).not.toBeInTheDocument()
  })

  test('clears messages in the local storage when the reset chat history button is clicked', () => {
    safeLocalStorage.setItem('playground-chat-messages', JSON.stringify(mockLocalStorage))
    render(
      <PlaygroundWrapper model={mockModel} modelInputSchema={mockModelInputSchema} gettingStarted={mockGettingStarted}>
        <Playground />
      </PlaygroundWrapper>,
    )

    const restoreButton = screen.getByRole('button', {name: 'Restore last session'})
    fireEvent.click(restoreButton)
    expect(screen.getByText('test message')).toBeInTheDocument()
    expect(screen.getByTestId('playground-chat-message')).toBeInTheDocument()

    const resetButton = screen.getByRole('button', {name: 'Reset chat history'})
    fireEvent.click(resetButton)

    expect(localStorage.getItem('playground-chat-messages')).toBeNull()
    expect(screen.queryByTestId('playground-chat-message')).not.toBeInTheDocument()
  })

  test('display sample message in the chat window', () => {
    render(
      <PlaygroundWrapper model={mockModel} modelInputSchema={mockModelInputSchema} gettingStarted={mockGettingStarted}>
        <Playground />
      </PlaygroundWrapper>,
    )

    expect(screen.getByText('sample message')).toBeInTheDocument()
    expect(screen.queryByTestId('playground-chat-message')).not.toBeInTheDocument()
  })
})
