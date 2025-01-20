import {type CommandPalette, Item as CommandPaletteItem, StaticItemsPage} from '@github-ui/command-palette'

import {getSubTreeEntries, isCommandTree, type Item} from '../command-tree'
import {sortSubtreeValues} from '../sort-subtree-values'

export class MemexCommandItem extends CommandPaletteItem {
  memexKey: string
  memexItem: Item
  commandItems: Array<MemexCommandItem> = []

  constructor(title: string, memexKey: string, memexItem: Item) {
    super({title, priority: 1, group: 'commands', hint: 'Run command'})

    this.memexKey = memexKey
    this.memexItem = memexItem
    this.buildCommandItems()
  }

  activate(commandPalette: CommandPalette): void {
    if (isCommandTree(this.memexItem)) {
      commandPalette.pushPage(this.staticItemsPage())
    } else {
      this.memexItem.effect()
      commandPalette.dismiss()
    }
  }

  copy(_commandPalette: CommandPalette): string | undefined {
    return undefined
  }

  select(commandPalette: CommandPalette): void {
    if (isCommandTree(this.memexItem)) {
      commandPalette.pushPage(this.staticItemsPage())
    } else {
      commandPalette.autocomplete(this)
    }
  }

  get path(): string | undefined {
    return undefined
  }

  private buildCommandItems(): void {
    if (!isCommandTree(this.memexItem)) return

    const items: Array<[string, Item]> = getSubTreeEntries(this.memexItem, []).sort(sortSubtreeValues)

    for (const [key, item] of items) {
      this.commandItems.push(new MemexCommandItem(item.description, key, item))
    }
  }

  private staticItemsPage(): StaticItemsPage {
    return new StaticItemsPage(this.title, `memex-items-page-${this.memexKey}`, this.commandItems)
  }
}
