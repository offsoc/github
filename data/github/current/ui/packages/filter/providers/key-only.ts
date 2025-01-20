import type {Icon} from '@primer/octicons-react'

import {defaultFilterProviderOptions} from '../constants/defaults'
import {FILTER_KEYS} from '../constants/filter-constants'
import type {FilterQuery} from '../filter-query'
import {
  type FilterBlock,
  type FilterKey,
  type FilterProvider,
  type FilterProviderOptions,
  FilterProviderType,
  type IndexedBlockValueItem,
  type SuppliedFilterProviderOptions,
  type ValueRowProps,
} from '../types'
import {capitalize} from '../utils'

export class KeyOnlyFilterProvider implements FilterProvider {
  key: string
  displayName: string
  description?: string
  priority: number
  type = FilterProviderType.Text
  icon: Icon
  options: FilterProviderOptions

  constructor(filterKey: FilterKey, options?: SuppliedFilterProviderOptions) {
    Object.assign(this, filterKey)
    this.key = filterKey.key
    this.icon = filterKey.icon
    this.displayName = filterKey.displayName ?? capitalize(filterKey.key)
    this.options = {
      ...defaultFilterProviderOptions,
      ...options,
      filterTypes: {
        ...defaultFilterProviderOptions.filterTypes,
        multiValue: false,
        valueless: false,
        ...options?.filterTypes,
      },
    }
    this.priority = this.options.priority
  }

  getSuggestions() {
    return null
  }

  validateFilterBlockValues(
    filterQuery: FilterQuery,
    block: FilterBlock,
    values: IndexedBlockValueItem[],
  ): IndexedBlockValueItem[] {
    return values.map(value => {
      return {
        ...value,
        valid: true,
      }
    })
  }

  getValueRowProps(): ValueRowProps {
    return {text: ''}
  }
}

export class BaseFilterProvider extends KeyOnlyFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.base, options)
  }
}

export class HeadFilterProvider extends KeyOnlyFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.head, options)
  }
}

export class InBodyFilterProvider extends KeyOnlyFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.inBody, options)
  }
}

export class InCommentsFilterProvider extends KeyOnlyFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.inComments, options)
  }
}

export class InTitleFilterProvider extends KeyOnlyFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.inTitle, options)
  }
}

export class ShaFilterProvider extends KeyOnlyFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.sha, options)
  }
}
