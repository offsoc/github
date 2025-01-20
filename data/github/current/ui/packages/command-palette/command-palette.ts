// The interfaces to be shared between the command palette and non-dotcom integrators (eg. memex).

import {score as fzyScore, hasMatch} from 'fzy.js'
import {crc32} from '@allex/crc32'

declare global {
  interface Window {
    commandPalette: CommandPalette | undefined
  }
}

export interface Query {
  readonly mode: string
  readonly text: string
  readonly path: string
  readonly scope: Scope

  hasScope(): boolean
  isBlank(): boolean
  immutableCopy(): Query
  params(): URLSearchParams
}

export interface Scope {
  text: string
  type: string
  id: string
}

export interface Page {
  title: string
  scopeId: string
  scopeType: string
  providers: Provider[]
}

export class StaticItemsPage implements Page {
  title: string
  scopeId: string
  providers: Provider[] = []
  readonly scopeType = 'static_items_page'

  constructor(title: string, scopeId: string, items: Item[]) {
    this.title = title
    this.scopeId = scopeId
    this.providers = [new StaticItemsProvider(items)]
  }
}

/**
 * This interface defines what a provider should respond with when `fetch` is invoked.
 */
export interface ProviderResponse {
  results: Item[]
  error?: boolean
  octicons?: Octicon[]
}

export interface Octicon {
  id: string
  svg: string
}

export interface Provider {
  fetch(query: Query, isEmpty: boolean): Promise<ProviderResponse>
  prefetch?: (query: Query) => Promise<void>
  enabledFor(query: Query): boolean
  clearCache(): void
  readonly hasCommands: boolean
  readonly debounce: number
}

export class StaticItemsProvider implements Provider {
  items: Item[]
  hasCommands = true
  debounce = 0

  constructor(items: Item[]) {
    const itemsCount = items.length
    this.items = items.map((item, index) => {
      item.priority = itemsCount - index
      return item
    })
  }

  async fetch(query: Query): Promise<ProviderResponse> {
    const items = this.fuzzyFilter(this.items, query)
    return {results: items}
  }

  enabledFor() {
    return true
  }

  clearCache() {
    // no-op
  }

  fuzzyFilter<T extends Item = Item>(items: T[], query: Query, minScore = 0) {
    if (query.isBlank()) {
      return items
    }

    const matchingItems = [] as T[]
    for (const item of items) {
      const score = item.calculateScore(query.text)
      if (score > minScore) {
        matchingItems.push(item)
      }
    }

    return matchingItems
  }
}

export interface CommandPalette {
  autocomplete(item: Item): void
  dismiss(): void
  registerProvider(providerId: string, provider: Provider): void
  pushPage(page: Page, clearExistingPagesBeforePush?: boolean): void
  clearCommands(resetInput: boolean): Promise<void>
}

export interface ItemData {
  title: string
  priority: number
  group: string
  subtitle?: string
  matchFields?: string[]
  typeahead?: string
  hint?: string
  icon?: Icon
  readonly path?: string
}

export interface Icon {
  type: string
  id?: string
  url?: string
  alt?: string
}

export interface ItemInteraction {
  activate(commandPalette: CommandPalette, event?: Event): void
  copy(commandPalette: CommandPalette): string | undefined
  select(commandPalette: CommandPalette): void
}

export abstract class Item implements ItemData, ItemInteraction {
  // MARK: - ItemData

  title: string
  priority: number
  group: string
  subtitle?: string
  matchFields?: string[]
  typeahead?: string
  hint?: string
  icon?: Icon
  abstract get path(): string | undefined

  // Memoization

  score = 0
  position = ''
  private _id: string | undefined

  // Constructor

  constructor(data: ItemData) {
    this.title = data.title
    this.priority = data.priority
    this.group = data.group
    this.subtitle = data.subtitle
    this.matchFields = data.matchFields
    this.typeahead = data.typeahead
    this.hint = data.hint
    this.icon = data.icon
  }

  // ItemInteraction

  abstract activate(commandPalette: CommandPalette, event?: Event): void
  abstract copy(commandPalette: CommandPalette): string | undefined
  abstract select(commandPalette: CommandPalette): void

  // Matching fields

  /**
   * To change how this item is matched, set `match_fields` in result data.
   * If not present, item will match against `this.title`.
   *
   * @returns list of strings to match against query
   */
  get matchingFields() {
    if (this.matchFields) {
      return this.matchFields
    } else {
      return [this.title]
    }
  }

  // Key related logic

  /**
   * Build a string that uniquely identifies this item. By default, an item is
   * identified from its action type, group and title.
   */
  get key() {
    return `${this.title}-${this.group}-${this.subtitle}-${this.matchFields?.join('-')}`
  }

  get id() {
    if (!this._id) {
      this._id = crc32(this.key).toString()
    }

    return this._id
  }

  // Score calculation

  /**
   * Calculate a score for this item for a given query text.
   *
   * This calculates a score for values returned by `matchFields` and returns the highest score.
   *
   * @param queryText string to match against
   */
  calculateScore(queryText: string) {
    const scores = this.matchingFields.map(field => this.calculateScoreForField({field, queryText}))
    return Math.max(...scores)
  }

  private calculateScoreForField({field, queryText}: {field: string; queryText: string}) {
    if (hasMatch(queryText, field)) {
      return fzyScore(queryText, field)
    } else {
      return -Infinity
    }
  }
}

/**
 * This abstract class defines the shared proprieties of all providers (defined within the command palette).
 */
export abstract class ProviderBase implements Provider {
  abstract fetch(query: Query, isEmpty: boolean): Promise<ProviderResponse>
  abstract enabledFor(query: Query): boolean
  abstract clearCache(): void
  abstract get hasCommands(): boolean
  abstract get debounce(): number

  /**
   * Filter and sort by relevance.
   *
   * Filtering is done by fuzzy matching against the title using fzy.js. During
   * filtering, items are updated with a score.
   *
   * @param items that should be filtered and sorted
   * @param query used to filter items
   * @param minScore items with a score greater than this will be returned (default 0)
   * @returns items that match query sorted by relevance
   */
  fuzzyFilter<T extends Item = Item>(items: T[], query: Query, minScore = 0) {
    if (query.isBlank()) {
      return items
    }

    const matchingItems = [] as T[]
    for (const item of items) {
      const score = item.calculateScore(query.text)
      if (score > minScore) {
        matchingItems.push(item)
      }
    }

    return matchingItems
  }
}
