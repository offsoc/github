/**
 * A command tree is a tree structure whose leaves are commands and whose nodes
 * may be commands or other command trees.
 */

import invariant from 'tiny-invariant'

/** A key pointing to an item in a command tree */
export type SpecKey = string
/** A list specifying the path to an item in a command tree */
export type SpecPath = Array<SpecKey>
/**
 * A short specifier used to register commands
 * A tuple containing
 * @param CommandSpec[0] A keyboard shortcut to register the command to
 * @param CommandSpec[1] A description of the command to display in the command palette
 * @param CommandSpec[2] A type to emit in postStats when the command is executed
 * @param CommandSpec[3] A function to call when the command is executed
 */
export type CommandSpec = [key: SpecKey, description: string, type: string, effect: () => void]
/**
 * A short specifier used to register command trees
 * A tuple containing
 * @param CommandTreeSpec[0] A keyboard shortcut to register the command to
 * @param CommandTreeSpec[1] A description of the command to display in the command palette
 * @param CommandTreeSpec[2] An array of ItemSpecs, describing the hierarchy of command palette sub-commands
 */
export type CommandTreeSpec = [key: SpecKey, description: string, values: Array<ItemSpec>]
/**
 * A short specifier to used register a command or command tree
 * @see {CommandSpec}
 * @see {CommandTreeSpec}
 */
export type ItemSpec = CommandSpec | CommandTreeSpec

/** A user-executable command */
type Command = {
  /** The human-readable command description */
  description: string
  /** A non-unique key describing the command type such as "column.hide" */
  type: string
  /** The function to call when this command executes */
  effect: () => unknown
}

/** A hierarchical tree of user-executable commands */
export type CommandTree = {
  /** The human-readable command tree description */
  description: string
  /** The values of the command tree—other command trees and commands */
  values: Map<string, Item>
}

/** A value in a command tree */
export type Item = Command | CommandTree

/**
 * Get the entries from the subtree of the given tree at the given path.
 *
 * @param tree The tree to get the subtree entries from
 * @param path The path to the subtree
 * @returns The subtree at the given path
 */
export function getSubTreeEntries(tree: CommandTree, path: SpecPath): Array<[string, Item]> {
  return Array.from(mustGetSubTreeFromTree(tree, path).values.entries())
}

/**
 * Create a new command tree.
 *
 * @param description The human-readable command tree description
 * @returns A new command tree
 */
export function createCommandTree(description: string, itemSpecs: Array<ItemSpec> = []): CommandTree {
  const values = itemSpecs.reduce((map, spec) => {
    if (isCommandSpec(spec)) {
      map.set(spec[0], createCommand(spec[1], spec[2], spec[3]))
    } else {
      map.set(spec[0], createCommandTree(spec[1], spec[2]))
    }

    return map
  }, new Map<string, Item>())

  return {description, values}
}

/**
 * Create a new command.
 *
 * @param description The human-readable command description
 * @param effect The function to call when this command executes
 * @returns A new command tree
 */
export function createCommand(description: string, type: string, effect: () => unknown): Command {
  return {description, type, effect}
}

/**
 * Get the command or command tree at the given path.
 *
 * @param tree The tree to get a command or tree from
 * @param path The path to get at
 * @returns The command or tree at the path
 */
function getItemFromTree(tree: CommandTree, path: SpecPath, parentPath: SpecPath = []): Item | null {
  if (path.length === 0) {
    return tree
  }

  const basePath = path[0]
  invariant(basePath != null, 'Path must have at least one item')

  if (path.length === 1) {
    return getTreeValue(tree, basePath)
  }

  const subTree = mustGetSubTreeFromTree(tree, basePath, parentPath)
  return getItemFromTree(subTree, path.slice(1), [...parentPath, basePath])
}

/**
 * Walk a full tree, yielding each item path and item.
 *
 * @param tree The tree to walk
 */
export function* walkCommandTree(tree: CommandTree, path: Array<string> = []): Generator<[Array<string>, Item]> {
  for (const [key, item] of tree.values.entries()) {
    path = [...path, key]
    yield [path, item]

    if (isCommandTree(item)) {
      yield* walkCommandTree(item, path)
    }

    path = path.slice(0, -1)
  }
}

/**
 * Register a new command tree.
 *
 * @param tree The root tree to register the new tree in
 * @param itemSpecs The spec of the tree to register
 *
 * @returns The root tree with the new command or command tree added
 */
export function registerCommandTree(tree: CommandTree, itemSpecs: ItemSpec): CommandTree {
  if (isCommandSpec(itemSpecs)) {
    // if item is not a commandTree add it to the tree and return the command.
    const command = createCommand(itemSpecs[1], itemSpecs[2], itemSpecs[3])
    return putTreeValue(tree, itemSpecs[0], command)
  }
  const [key, description, values] = itemSpecs
  const newTree = createCommandTree(description, values)
  return putTreeValue(tree, key, newTree)
}

/**
 * De-register a command tree from a tree.
 *
 * @param tree The root tree to de-register the item from
 * @param spec The spec of the tree to de-register
 * @returns The root tree with the command tree removed
 */
export function deregisterCommandTree(tree: CommandTree, [key]: ItemSpec): CommandTree {
  return removeTreeValue(tree, key)
}

/**
 * Determine whether a tree item is a command.
 *
 * @param item The item to test whether it is a command
 *
 * @returns Whether `commandOrTree` is a command
 */
export function isCommand(item: Item): item is Command {
  return !isCommandTree(item)
}

/**
 * Determine whether a tree item is a command tree.
 *
 * @param item The item to test whether it is a command tree
 *
 * @returns Whether `item` is a command tree
 */
export function isCommandTree(item: Item): item is CommandTree {
  return 'values' in item
}

function isCommandSpec(spec: ItemSpec): spec is CommandSpec {
  return !isCommandTreeSpec(spec)
}

function isCommandTreeSpec(spec: ItemSpec): spec is CommandTreeSpec {
  return Array.isArray(spec[2])
}

function getTreeValue(tree: CommandTree, key: string): Item | null {
  return tree.values.get(key) ?? null
}

function putTreeValue(tree: CommandTree, key: string, value: Item): CommandTree {
  const values = new Map(tree.values)
  values.set(key, value)
  return {...tree, values}
}

function removeTreeValue(tree: CommandTree, key: string): CommandTree {
  const values = new Map(tree.values)
  values.delete(key)
  return {...tree, values}
}

function getSubTreeFromTree(tree: CommandTree, path: SpecPath | string, parentPath: SpecPath = []): CommandTree | null {
  const finalPath = typeof path === 'string' ? [path] : path
  const result = getItemFromTree(tree, finalPath)

  if (!result) {
    return null
  }

  if (isCommand(result)) {
    throw new Error(`Command at path where command tree expected: ${[...parentPath, ...finalPath].join(',')}`)
  }

  return result
}

function mustGetSubTreeFromTree(tree: CommandTree, path: SpecPath | string, parentPath: SpecPath = []): CommandTree {
  const finalPath = typeof path === 'string' ? [path] : path
  const result = getSubTreeFromTree(tree, finalPath, parentPath)

  if (!result) {
    throw new Error(`Command tree does not exist at path: ${[...parentPath, ...finalPath].join(',')}`)
  }

  return result
}
