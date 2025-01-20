import {createContext, useContext} from 'react'

import type {CommandId} from './commands'
import {dispatchGlobalCommand} from './components/GlobalCommands'

interface CommandsContext {
  triggerCommand: (id: CommandId, domEvent: KeyboardEvent | MouseEvent) => void
}

const CommandsContext = createContext<CommandsContext>({
  // Without any scope context, we just emit a global event
  triggerCommand: dispatchGlobalCommand,
})

export const CommandsContextProvider = CommandsContext.Provider

export const useCommandsContext = () => useContext(CommandsContext)
