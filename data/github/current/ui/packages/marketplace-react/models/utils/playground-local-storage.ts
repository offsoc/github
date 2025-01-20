import safeStorage from '@github-ui/safe-storage'
import type {PlaygroundMessage} from './model-client'

export type StoredChatMessages = {
  modelName: string
  messages: PlaygroundMessage[]
}

const safeLocalStorage = safeStorage('localStorage', {
  ttl: 1000 * 60 * 60 * 24,
  throwQuotaErrorsOnSet: false,
})

export function getSavedPlaygroundMessages() {
  const savedMessages = safeLocalStorage.getItem('playground-chat-messages')
  return savedMessages
    ? JSON.parse(savedMessages, (key, value) => {
        if (key === 'timestamp') {
          return new Date(value)
        } else {
          return value
        }
      })
    : null
}

export function setPlaygroundMessages(chatMessages: StoredChatMessages) {
  const value = JSON.stringify(chatMessages)
  safeLocalStorage.setItem('playground-chat-messages', value)
}

export function clearPlaygroundLocalStorage() {
  safeLocalStorage.removeItem('playground-chat-messages')
}

export type SidebarSelection = 'parameters' | 'details'

export type ModelPersistentUIState = {
  sidebarSelection: number
  sidebarHidden: boolean
  preferredLanguage: string // value is validated by the components, as it depends on the model
  preferredSdk: string // value is validated by the components, as it depends on the model
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidModelPersistentUIState(state: any): state is ModelPersistentUIState {
  const validKeys: Array<keyof ModelPersistentUIState> = [
    'sidebarSelection',
    'sidebarHidden',
    'preferredLanguage',
    'preferredSdk',
  ]

  return (
    typeof state === 'object' &&
    state !== null &&
    validKeys.every(key => key in state) &&
    typeof state.sidebarSelection === 'number' &&
    typeof state.sidebarHidden === 'boolean' &&
    typeof state.preferredLanguage === typeof 'string' &&
    typeof state.preferredSdk === typeof 'string'
  )
}

export class PlaygroundLocalStorage {
  uiStateKey = 'models:uiState'
  marketplaceModelsPreferredLanguageKey = 'marketplaceModelsPreferredLanguage'

  set uiState(uiState: ModelPersistentUIState) {
    safeLocalStorage.setItem(this.uiStateKey, JSON.stringify(uiState))
  }

  get uiState(): ModelPersistentUIState {
    const defaultValues: ModelPersistentUIState = {
      sidebarSelection: 0,
      sidebarHidden: false,
      preferredLanguage: 'js',
      preferredSdk: '',
    }

    const storedStateJSON = safeLocalStorage.getItem(this.uiStateKey)
    if (storedStateJSON) {
      const storedState = JSON.parse(storedStateJSON)
      if (storedState) {
        if (isValidModelPersistentUIState(storedState)) {
          return storedState
        }
      }
    }

    return defaultValues
  }
}
