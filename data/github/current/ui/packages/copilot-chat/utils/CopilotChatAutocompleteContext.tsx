import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo} from 'react'

import {CopilotAutocompleteManager} from './copilot-autocompletions'
import {useChatManager} from './CopilotChatManagerContext'

const CopilotChatAutocompleteContext = createContext<CopilotAutocompleteManager | null>(null)

export function CopilotChatAutocompleteProvider({children}: PropsWithChildren) {
  const manager = useChatManager()
  const autocomplete = useMemo(() => new CopilotAutocompleteManager(manager), [manager])
  return (
    <CopilotChatAutocompleteContext.Provider value={autocomplete}>{children}</CopilotChatAutocompleteContext.Provider>
  )
}

export function useChatAutocomplete() {
  return useContext(CopilotChatAutocompleteContext)!
}
