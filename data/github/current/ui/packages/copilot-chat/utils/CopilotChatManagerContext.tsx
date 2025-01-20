import {debounce} from '@github/mini-throttle'
import type {Dispatch, PropsWithChildren} from 'react'
import {createContext, useContext, useEffect, useMemo} from 'react'

import {CopilotChatManager} from './copilot-chat-manager'
import type {CopilotChatAction, CopilotChatState} from './copilot-chat-reducer'
import type {CopilotChatOrg} from './copilot-chat-types'
import {copilotFeatureFlags} from './copilot-feature-flags'
import {copilotLocalStorage} from './copilot-local-storage'

const CopilotChatManagerContext = createContext<CopilotChatManager | null>(null)

export interface CopilotChatManagerProviderProps {
  apiURL: string
  state: CopilotChatState
  dispatch: Dispatch<CopilotChatAction>
  ssoOrganizations: CopilotChatOrg[]
}

export function CopilotChatManagerProvider({
  apiURL,
  state,
  dispatch,
  ssoOrganizations,
  children,
}: PropsWithChildren<CopilotChatManagerProviderProps>) {
  const manager = useMemo(
    () => new CopilotChatManager(dispatch, apiURL, ssoOrganizations),
    [dispatch, apiURL, ssoOrganizations],
  )

  useEffect(() => {
    const fetchCurrentTopic = async () => {
      if (state.selectedThreadID && state.messages.length > 0 && !state.currentTopic) {
        const currentThreadTopic = copilotLocalStorage.getSelectedTopic(state.selectedThreadID)
        if (currentThreadTopic) {
          const numberId = Number(currentThreadTopic)
          if (!isNaN(numberId)) {
            await manager.fetchCurrentRepo(numberId)
          } else {
            await manager.fetchCurrentDocset(currentThreadTopic)
          }
        }
      }
    }
    void fetchCurrentTopic()
  }, [state.selectedThreadID, manager, state.messages.length, state.currentTopic])

  useEffect(() => {
    const fetchContextPage = async () => {
      const hash = window.location.hash
      const pathName = window.location.pathname
      const url = window.location.hash ? `${pathName}${hash}` : pathName
      const urlParts = url.slice(1).split('/')
      if (urlParts.length < 2) {
        return
      }

      const owner = urlParts[0]
      const repo = urlParts[1]

      if (!owner || !repo) {
        return
      }

      await manager.fetchImplicitContext(url, owner, repo)
    }

    const voidFetch = () => {
      void fetchContextPage()
    }

    const debouncedFetch = debounce(voidFetch, 500)

    function watchHistoryEvents() {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const {replaceState} = window.history

      window.history.replaceState = function (...args) {
        replaceState.apply(window.history, args)
        window.dispatchEvent(new Event('replaceState'))
      }

      window.addEventListener('popstate', debouncedFetch)
      window.addEventListener('replaceState', debouncedFetch)

      return () => {
        window.removeEventListener('popstate', debouncedFetch)
        window.removeEventListener('replaceState', debouncedFetch)
      }
    }

    if (copilotFeatureFlags.implicitContext) {
      debouncedFetch()
      watchHistoryEvents()
    }
  }, [manager])

  return <CopilotChatManagerContext.Provider value={manager}>{children}</CopilotChatManagerContext.Provider>
}

export function useChatManager() {
  return useContext(CopilotChatManagerContext)!
}
