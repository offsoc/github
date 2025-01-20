/**
 * This module provides a command palette and shortcut mode for Memex.
 *
 * This allows for the definition of a tree of keyboard shortcuts rather than a
 * flat list of shortcuts using key modifiers. The user navigates this tree
 * using a visual aid that displays commands stemming from their current
 * incomplete command.
 */

import {createContext} from 'react'

import type {ItemSpec} from './command-tree'

type ContextValue = {
  registerCommands: (commands: ItemSpec) => void
  deregisterCommands: (commands: ItemSpec) => void
}

export const StatelessContext = createContext<ContextValue | null>(null)
