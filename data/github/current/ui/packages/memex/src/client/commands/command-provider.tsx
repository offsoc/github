import {memo, useEffect, useMemo, useState} from 'react'

import {
  type CommandTree,
  createCommandTree,
  deregisterCommandTree,
  type ItemSpec,
  registerCommandTree,
} from './command-tree'
import {StatelessContext} from './context'
import {MemexProvider} from './dotcom/memex-provider'

/**
 * Set up the Command context and provide functions to update the command
 * palette navigation state.
 */
export const CommandProvider = memo(function CommandProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  const [tree, setTree] = useState<CommandTree>(createCommandTree('root'))
  const [deregisters, setDeregisters] = useState<Array<ItemSpec>>([])
  const [registers, setRegisters] = useState<Array<ItemSpec>>([])

  useEffect(() => {
    if (registers.length === 0 && deregisters.length === 0) {
      return
    }

    let newTree = tree

    // When deregistering, we remove commands before command trees.
    newTree = deregisters.reduce(deregisterCommandTree, newTree)

    // When registering, we add command trees before commands.
    newTree = registers.reduce(registerCommandTree, newTree)

    setTree(newTree)

    // This ensures that we empty out only the registers/deregisters that we
    // used this cycle—calling `setRegisters([])` may erase some
    // subsequently-registered commands.
    const registeredCount = registers.length
    const deregisteredCount = deregisters.length
    setRegisters(r => r.slice(registeredCount)) // where r = registers
    setDeregisters(d => d.slice(deregisteredCount)) // d = deregisters
  }, [deregisters, registers, tree])

  const statelessContextValue = useMemo(
    () => ({
      registerCommands: (treeSpec: ItemSpec) => {
        setRegisters(reg => [...reg, treeSpec])
      },
      deregisterCommands: (treeSpec: ItemSpec) => {
        setDeregisters(dr => [...dr, treeSpec])
      },
    }),
    [],
  )

  /**
   * Wait for the command palette to be loaded, then register dotcom memex provider.
   */
  useEffect(() => {
    function setupCommandPalette() {
      window.commandPalette?.registerProvider('memex-provider', new MemexProvider(tree))
    }

    if (window.commandPalette) {
      setupCommandPalette()
    } else {
      document.addEventListener('command-palette-ready', setupCommandPalette)
    }

    return () => {
      document.removeEventListener('command-palette-ready', setupCommandPalette)
    }
  }, [tree])

  return <StatelessContext.Provider value={statelessContextValue}>{children}</StatelessContext.Provider>
})
