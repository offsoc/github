import {useContext, useEffect, useMemo} from 'react'

import type {CommandSpec, CommandTreeSpec} from './command-tree'
import {StatelessContext} from './context'

/**
 * Register commands that will be available in the command tree.
 *
 * @param commandsFn A function that returns either a CommandTreeSpec, CommandSpec, or null, this is passed directly to a useMemo internally
 * @param commandsFnDeps An array of dependencies for the commandsFn, passed as the second arg to memoize it
 */
export function useCommands(commandsFn: () => CommandTreeSpec | CommandSpec | null, commandsFnDeps: Array<any>): void {
  const contextValue = useContext(StatelessContext)
  if (!contextValue) throw new Error('useCommands must be used within a <CommandProvider>')
  const {registerCommands, deregisterCommands} = contextValue

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commands = useMemo(commandsFn, commandsFnDeps)

  // Remove our commands when the component unmounts.
  useEffect(() => {
    if (!commands) return
    registerCommands(commands)
    return () => deregisterCommands(commands)
  }, [commands, deregisterCommands, registerCommands])
}
