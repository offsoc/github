import {createContext, useContext} from 'react'
import {AzureModelClient, type PlaygroundMessage, type PlaygroundRequestParameters} from './model-client'
import type {Model, ModelInputSchema, ModelInputSchemaParameter} from '../../types'
import type {ShowModelGettingStartedPayloadLanguageEntry} from '../routes/playground/components/GettingStartedDialog/types'
import {RetryableError, TokenLimitReachedResponseError} from './playground-types'
import {clearPlaygroundLocalStorage, PlaygroundLocalStorage} from './playground-local-storage'

type PlaygroundState = typeof initialPlaygroundState

export const initialPlaygroundState = {
  messages: [] as PlaygroundMessage[],
  parameters: {} as PlaygroundRequestParameters,
  isLoading: false,
  systemPrompt: '',
  chatInput: '',
  chatClosed: false,
  showParameters: true,
  showParametersOnMobile: false,
  parametersHasChanges: false,
  tab: 0,
  selectedLanguage: 'js',
  iceBreakerCheckPending: true, // used to avoid flashing of empty states before an ice breaker was sent
  selectedSDK: '',
}

export const PlaygroundStateContext = createContext<PlaygroundState>(initialPlaygroundState)
export const PlaygroundStateDispatcherContext = createContext<React.Dispatch<PlaygroundStateAction>>(
  {} as React.Dispatch<PlaygroundStateAction>,
)
export const PlaygroundManagerContext = createContext<PlaygroundManager>({} as PlaygroundManager)

export function usePlaygroundState() {
  return useContext(PlaygroundStateContext)
}

export function usePlaygroundManager() {
  return useContext(PlaygroundManagerContext)
}

export function usePlaygroundDispatcher() {
  return useContext(PlaygroundStateDispatcherContext)
}

export type PlaygroundStateAction =
  | {type: 'SET_MESSAGES'; messages: PlaygroundMessage[]}
  | {type: 'SET_IS_LOADING'; isLoading: boolean}
  | {type: 'ADD_ERROR_RESPONSE'; message: string}
  | {type: 'SET_PARAMETERS'; parameters: PlaygroundRequestParameters}
  | {type: 'SET_SYSTEM_PROMPT'; systemPrompt: string}
  | {type: 'CLEAR_LAST_PLACEHODER_MESSAGE'}
  | {type: 'RETRY_LAST_MESSAGE'}
  | {type: 'SET_CHAT_INPUT'; chatInput: string}
  | {type: 'SET_CHAT_CLOSED'; chatClosed: boolean}
  | {type: 'SET_SHOW_PARAMETERS'; showParameters: boolean}
  | {type: 'SET_SHOW_PARAMETERS_ON_MOBILE'; showParametersOnMobile: boolean}
  | {type: 'SET_PARAMETERS_HAS_CHANGES'; parametersHasChanges: boolean}
  | {type: 'SET_TAB'; tab: number}
  | {type: 'SET_SELECTED_LANGUAGE'; selectedLanguage: string}
  | {type: 'SET_ICEBREAKER_CHECK_PENDING'; iceBreakerCheckPending: boolean}
  | {type: 'SET_SELECTED_SDK'; selectedSDK: string}

export function tasksReducer(state: PlaygroundState, action: PlaygroundStateAction): PlaygroundState {
  switch (action.type) {
    case 'SET_IS_LOADING':
      return {...state, isLoading: action.isLoading}
    case 'SET_MESSAGES':
      return {...state, messages: action.messages}
    case 'SET_PARAMETERS':
      return {...state, parameters: action.parameters}
    case 'SET_SYSTEM_PROMPT':
      return {...state, systemPrompt: action.systemPrompt}
    case 'ADD_ERROR_RESPONSE':
      return {...state, messages: [...state.messages, {timestamp: new Date(), role: 'error', message: action.message}]}
    case 'CLEAR_LAST_PLACEHODER_MESSAGE': {
      const lastMessage = state.messages.slice(-1)[0]
      if (!lastMessage) return {...state}
      if (lastMessage.role === 'assistant' && lastMessage?.message === '') {
        return {...state, messages: state.messages.slice(0, -1)}
      } else {
        return {...state}
      }
    }
    case 'SET_CHAT_CLOSED': {
      return {...state, chatClosed: action.chatClosed}
    }
    case 'SET_CHAT_INPUT':
      return {...state, chatInput: action.chatInput}
    case 'RETRY_LAST_MESSAGE': {
      const lastUserMessage = [...state.messages].reverse().find(message => message.role === 'user')
      return lastUserMessage ? {...state, chatInput: lastUserMessage.message} : {...state}
    }
    case 'SET_PARAMETERS_HAS_CHANGES':
      return {...state, parametersHasChanges: action.parametersHasChanges}
    case 'SET_SHOW_PARAMETERS':
      return {...state, showParameters: action.showParameters}
    case 'SET_SHOW_PARAMETERS_ON_MOBILE':
      return {...state, showParametersOnMobile: action.showParametersOnMobile}
    case 'SET_TAB':
      return {...state, tab: action.tab}
    case 'SET_SELECTED_LANGUAGE':
      return {...state, selectedLanguage: action.selectedLanguage}
    case 'SET_ICEBREAKER_CHECK_PENDING':
      return {...state, iceBreakerCheckPending: action.iceBreakerCheckPending}
    case 'SET_SELECTED_SDK':
      return {...state, selectedSDK: action.selectedSDK}
  }
}

export enum SidebarSelectionOptions {
  PARAMETERS = 0,
  DETAILS = 1,
}

export class PlaygroundManager {
  dispatch: React.Dispatch<PlaygroundStateAction>

  client: AzureModelClient
  model: Model
  modelInputSchema: ModelInputSchema
  localStorage = new PlaygroundLocalStorage()
  gettingStarted: Record<string, ShowModelGettingStartedPayloadLanguageEntry>

  constructor(
    dispatch: React.Dispatch<PlaygroundStateAction>,
    model: Model,
    playgroundURL: string,
    modelInputSchema: ModelInputSchema,
    gettingStarted: Record<string, ShowModelGettingStartedPayloadLanguageEntry>,
  ) {
    this.dispatch = dispatch
    this.model = model
    this.client = new AzureModelClient(playgroundURL)
    this.modelInputSchema = modelInputSchema
    this.gettingStarted = gettingStarted

    this.setDefaultParameters(modelInputSchema.parameters)

    this.setPreferredLanguageFromLocalStorage()

    const storedDefaults = this.localStorage.uiState
    this.setTab(storedDefaults.sidebarSelection)
    this.setShowParameters(!storedDefaults.sidebarHidden)
  }

  setModel(
    model: Model,
    playgroundURL: string,
    modelInputSchema: ModelInputSchema,
    gettingStarted: Record<string, ShowModelGettingStartedPayloadLanguageEntry>,
  ) {
    if (this.model.name === model.name) {
      return
    }

    this.stopStreaming()
    this.setMessages([])
    this.setDefaultParameters(modelInputSchema.parameters)

    this.client = new AzureModelClient(playgroundURL)
    this.model = model
    this.modelInputSchema = modelInputSchema
    this.gettingStarted = gettingStarted
  }

  checkForIcebreakerRan = false
  checkForIcebreaker(message: string | undefined, state: PlaygroundState) {
    if (this.checkForIcebreakerRan) {
      return
    }
    if (state.iceBreakerCheckPending) {
      if (message) {
        this.sendMessage(state, message)
      }
    }
    this.checkForIcebreakerRan = true
    this.dispatch({type: 'SET_ICEBREAKER_CHECK_PENDING', iceBreakerCheckPending: false})
  }

  setPreferredLanguageFromLocalStorage() {
    const savedLanguage = this.localStorage.uiState.preferredLanguage
    const languages = this.getAvailableLanguages()
    const language = languages.includes(savedLanguage) ? savedLanguage : languages[0]
    if (!language) return

    const savedSdk = this.localStorage.uiState.preferredSdk
    this.setSelectedLanguage(language, savedSdk)
  }

  setSelectedLanguage(selectedLanguage: string, selectedSDK: string) {
    const languageSnippet = this.gettingStarted[selectedLanguage]
    // Code sample for C# is currently not available
    if (selectedLanguage === 'csharp') return
    if (languageSnippet) {
      this.localStorage.uiState = {...this.localStorage.uiState, preferredLanguage: selectedLanguage}
      this.dispatch({type: 'SET_SELECTED_LANGUAGE', selectedLanguage})

      const sdks = Object.keys(languageSnippet.sdks)
      const savedSDKSnippet = sdks.find(sdk => sdk === selectedSDK)
      const sdk = savedSDKSnippet ? savedSDKSnippet : sdks[0]
      if (sdk) this.setSelectedSDK(sdk)
    }
  }

  setSelectedSDK(selectedSDK: string) {
    this.localStorage.uiState = {...this.localStorage.uiState, preferredSdk: selectedSDK}
    this.dispatch({type: 'SET_SELECTED_SDK', selectedSDK})
  }

  handleRequestParameterChange(state: PlaygroundState, key: string, value: string | number | boolean | string[]) {
    const newParams = {
      ...state.parameters,
      [key]: value,
    } as PlaygroundRequestParameters
    this.dispatch({type: 'SET_PARAMETERS', parameters: newParams})
  }

  setDefaultParameters(parameters: ModelInputSchemaParameter[]) {
    const schema = parameters.reduce((acc, parameter) => {
      acc[parameter.key] = parameter.default
      return acc
    }, {} as PlaygroundRequestParameters)
    this.dispatch({type: 'SET_PARAMETERS', parameters: schema})
  }

  setChatInput(chatInput: string) {
    this.dispatch({type: 'SET_CHAT_INPUT', chatInput})
  }

  setSystemPrompt(systemPrompt: string) {
    this.dispatch({type: 'SET_SYSTEM_PROMPT', systemPrompt})
  }

  setMessages(messages: PlaygroundMessage[]) {
    this.dispatch({type: 'SET_MESSAGES', messages})
  }

  setShowParameters(showParameters: boolean) {
    this.localStorage.uiState = {...this.localStorage.uiState, sidebarHidden: !showParameters}
    this.dispatch({type: 'SET_SHOW_PARAMETERS', showParameters})
  }

  setShowParametersOnMobile(showParametersOnMobile: boolean) {
    this.dispatch({type: 'SET_SHOW_PARAMETERS_ON_MOBILE', showParametersOnMobile})
  }

  setParametersHasChanges(parametersHasChanges: boolean) {
    this.dispatch({type: 'SET_PARAMETERS_HAS_CHANGES', parametersHasChanges})
  }

  setTab(tab: number) {
    this.localStorage.uiState = {...this.localStorage.uiState, sidebarSelection: tab}
    this.dispatch({type: 'SET_TAB', tab})
  }

  resetHistory(clearLocalStorage: boolean) {
    if (clearLocalStorage) {
      clearPlaygroundLocalStorage()
    }
    this.stopStreaming()
    this.dispatch({type: 'SET_MESSAGES', messages: []})
    this.dispatch({type: 'SET_CHAT_CLOSED', chatClosed: false})
  }

  stopStreaming() {
    this.client.streamer?.stop()
  }

  async sendMessage(state: PlaygroundState, message: string): Promise<void> {
    const messages = state.messages

    if (!this.model) {
      return
    }

    messages.push({
      timestamp: new Date(),
      role: 'user',
      message,
    })

    // Add placeholder message
    messages.push({
      timestamp: new Date(),
      role: 'assistant',
      message: '',
    })

    // Update the UI
    this.dispatch({type: 'SET_MESSAGES', messages})
    this.dispatch({type: 'SET_IS_LOADING', isLoading: true})

    // Start work
    try {
      const success = await this.client.sendMessage(
        this.model,
        state.messages,
        state.parameters,
        state.systemPrompt,
        response => {
          this.dispatch({type: 'SET_MESSAGES', messages: [...messages.slice(0, -1), response]})
        },
      )

      if (!success) {
        this.dispatch({type: 'CLEAR_LAST_PLACEHODER_MESSAGE'})
        this.dispatch({type: 'ADD_ERROR_RESPONSE', message: 'An error occurred. Please try again.'})
      }
    } catch (error) {
      // TODO: Messages should probably have an ID so we can refer to them correctly in the future
      this.dispatch({type: 'CLEAR_LAST_PLACEHODER_MESSAGE'})
      if (error instanceof Error) {
        this.dispatch({type: 'ADD_ERROR_RESPONSE', message: error.message})
        if (error instanceof RetryableError) {
          this.dispatch({type: 'RETRY_LAST_MESSAGE'})
        }
        if (error instanceof TokenLimitReachedResponseError) {
          this.dispatch({type: 'SET_CHAT_CLOSED', chatClosed: true})
        }
      } else {
        this.dispatch({type: 'ADD_ERROR_RESPONSE', message: 'An error occurred. Please try again.'})
      }
    } finally {
      this.dispatch({type: 'SET_IS_LOADING', isLoading: false})
    }
  }

  private getAvailableLanguages() {
    // Some languages are only available in the getting started section and not in the code sample view
    return Object.keys(this.gettingStarted).filter(language => {
      const content = this.gettingStarted[language]
      if (content && content.sdks) {
        return Object.values(content.sdks).some(sdk => {
          return sdk.codeSamples && sdk.codeSamples.length > 0
        })
      }
    })
  }
}
