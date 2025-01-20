import {ProviderBase, type ProviderResponse, type Query} from '@github-ui/command-palette'

import {
  type CommandTree,
  getSubTreeEntries,
  isCommand,
  type Item,
  type SpecPath,
  walkCommandTree,
} from '../command-tree'
import {sortSubtreeValues} from '../sort-subtree-values'
import {MemexCommandItem} from './memex-command-item'

export class MemexProvider extends ProviderBase {
  id = 'memex-provider'
  hasCommands = true
  debounce = 0
  commandItems: Array<MemexCommandItem> = []
  commandTree: CommandTree

  constructor(commandTree: CommandTree) {
    super()
    this.commandTree = commandTree
    this.buildCommandItems()
  }

  clearCache(): void {
    // no-op
  }

  enabledFor(query: Query): boolean {
    const modes = query.mode === '>' || query.mode === ''
    const memexScope = query.scope.type === 'memex_project'
    return modes && memexScope
  }

  async fetch(query: Query, _isEmpty: boolean): Promise<ProviderResponse> {
    let items = [...this.commandItems]

    // If the query text is empty, return the top-level command items and leaf
    // level items filtered by the query text.
    if (query.text.trim().length !== 0) {
      const commands: Array<[SpecPath, Item]> = []
      for (const [pathList, item] of walkCommandTree(this.commandTree)) {
        if (isCommand(item)) {
          commands.push([pathList, item])
        }
      }

      for (const [key, item] of commands) {
        items.push(new MemexCommandItem(item.description, key.join('-'), item))
      }

      items = this.fuzzyFilter(items, query)
    }

    return {results: items}
  }

  private buildCommandItems(): void {
    // sort top-level items in memex command tree
    const items: Array<[string, Item]> = getSubTreeEntries(this.commandTree, []).sort(sortSubtreeValues)

    for (const [key, item] of items) {
      this.commandItems.push(new MemexCommandItem(item.description, key, item))
    }

    // set priority on top-level command items
    for (const [index, commandItem] of this.commandItems.entries()) {
      commandItem.priority = this.commandItems.length - index
    }
  }
}
