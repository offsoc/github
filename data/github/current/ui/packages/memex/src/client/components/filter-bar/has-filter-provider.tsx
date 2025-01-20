import type {
  AnyBlock,
  ARIAFilterSuggestion,
  FilterBlock,
  FilterConfig,
  FilterKey,
  FilterProvider,
  FilterQuery,
  FilterSuggestion,
  FilterValueData,
  IndexedBlockValueItem,
  MutableFilterBlock,
  SuppliedFilterProviderOptions,
  ValueRowProps,
} from '@github-ui/filter'
import {defaultFilterProviderOptions, FilterValueType} from '@github-ui/filter'
import {
  caseInsensitiveStringCompare,
  findExistingValueUsage,
  getFilterValue,
  getLastFilterBlockValue,
  getUnescapedFilterValue,
  ValueIcon,
} from '@github-ui/filter/utils'
import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'
import {PlusCircleIcon} from '@primer/octicons-react'
import {hasMatch} from 'fzy.js'

import {RootFilterProvider} from '../../../../../filter/providers/root'

const hasFilterKey: FilterKey = {
  key: 'has',
  displayName: 'Has',
  description: 'Filter by items which have any value for metadata',
  priority: 1,
  icon: PlusCircleIcon,
}

export class HasFilterProvider extends RootFilterProvider implements FilterProvider {
  filterValues: Array<ARIAFilterSuggestion>

  constructor(filterValues: Array<FilterSuggestion>, options?: SuppliedFilterProviderOptions) {
    super(hasFilterKey, options)

    this.options = {
      ...defaultFilterProviderOptions,
      ...options,
      filterTypes: {...defaultFilterProviderOptions.filterTypes, valueless: false, ...options?.filterTypes},
    }

    this.filterValues = filterValues.map(fv => ({...fv, ariaLabel: `${fv.displayName}, ${this.displayName}`}))
  }

  async getSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    config: FilterConfig,
    caretIndex?: number | null,
  ) {
    if (!this.shouldGetSuggestions(filterBlock)) return null

    const lastValue = getLastFilterBlockValue(filterBlock, caretIndex)
    const suggestions: Array<ARIAFilterSuggestion> = []

    if (!lastValue)
      return this.filterValues.filter(fv => {
        const existingBlocks = findExistingValueUsage(filterQuery, this.key, getUnescapedFilterValue(fv.value))

        return existingBlocks.length < 1
      })

    for (const filterValue of this.filterValues) {
      const {value: fValue, displayName} = filterValue
      const value = getFilterValue(fValue)

      const matchesValue = !!value && hasMatch(lastValue, value)
      const matchesDisplayName = !!displayName && hasMatch(lastValue, displayName)

      // Make sure that this value hasn't been used already
      const existingValues = findExistingValueUsage(filterQuery, this.key, getUnescapedFilterValue(value))

      if (existingValues.length > 0) continue

      if (!value || (!matchesValue && !matchesDisplayName)) continue
      filterValue.priority -= fuzzyScore(lastValue, value)

      suggestions.push({...filterValue, type: FilterValueType.Value})
    }

    return suggestions
  }

  async validateFilterBlockValues(
    filterQuery: FilterQuery,
    block: FilterBlock,
    values: Array<IndexedBlockValueItem>,
  ): Promise<Array<IndexedBlockValueItem>> {
    return values.map((v, i) => {
      const extractedValue = getFilterValue(v.value)

      const existingBlocks = findExistingValueUsage(
        filterQuery,
        this.key,
        getUnescapedFilterValue(extractedValue),
      ).sort((a, b) => a.id - b.id)

      let valid =
        !!extractedValue &&
        !!this.filterValues.find(fv => caseInsensitiveStringCompare(getFilterValue(fv.value) ?? '', extractedValue))

      if (
        existingBlocks[0]?.id !== undefined &&
        (block.id !== existingBlocks[0].id || values.findIndex(val => val.value === extractedValue) < i)
      )
        valid = false

      return {
        ...v,
        valid,
      }
    })
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
      leadingVisual: ValueIcon({value}),
    }
  }
}
