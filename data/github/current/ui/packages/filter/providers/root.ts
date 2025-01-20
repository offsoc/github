import type {Icon} from '@primer/octicons-react'

import {defaultFilterProviderOptions} from '../constants/defaults'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  BlockType,
  type FilterKey,
  type FilterProviderOptions,
  FilterProviderType,
  type FilterValueValidator,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type SuppliedFilterProviderOptions,
  type WithRequiredProperty,
} from '../types'
import {capitalize, shouldProviderShowSuggestions} from '../utils'

export class RootFilterProvider implements WithRequiredProperty<FilterKey, 'options'> {
  key: string
  displayName: string
  description?: string
  priority: number
  type: FilterProviderType
  icon: Icon
  options: FilterProviderOptions

  constructor(filterKey: FilterKey, options?: SuppliedFilterProviderOptions) {
    Object.assign(this, filterKey)
    this.key = filterKey.key
    this.icon = filterKey.icon
    this.type = FilterProviderType.Text
    this.displayName = filterKey.displayName ?? capitalize(filterKey.key)

    this.options = {
      ...defaultFilterProviderOptions,
      priority: filterKey.priority,
      ...options,
      filterTypes: {...defaultFilterProviderOptions.filterTypes, ...options?.filterTypes},
    }
    this.priority = this.options.priority
  }

  shouldGetSuggestions(filterBlock: AnyBlock | MutableFilterBlock): boolean {
    return (
      filterBlock &&
      filterBlock.type !== BlockType.Space &&
      shouldProviderShowSuggestions(filterBlock, this.options.filterTypes.multiValue)
    )
  }
}

export class ValueValidator<T = unknown> extends RootFilterProvider implements FilterValueValidator<T> {
  validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    data: T | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    if (!data) return false

    return data
  }
}
