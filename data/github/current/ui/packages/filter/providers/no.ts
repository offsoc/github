import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'
import {hasMatch} from 'fzy.js'

import {defaultFilterProviderOptions} from '../constants/defaults'
import {FILTER_KEYS} from '../constants/filter-constants'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  type FilterBlock,
  type FilterConfig,
  type FilterProvider,
  FilterProviderType,
  type FilterSuggestion,
  type FilterValueData,
  FilterValueType,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type SuppliedFilterProviderOptions,
  type ValueRowProps,
} from '../types'
import {
  caseInsensitiveStringCompare,
  findExistingValueUsage,
  getFilterValue,
  getLastFilterBlockValue,
  getUnescapedFilterValue,
} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {RootFilterProvider} from './root'

export class NoFilterProvider extends RootFilterProvider implements FilterProvider {
  filterValues: ARIAFilterSuggestion[]

  constructor(filterValues: FilterSuggestion[], options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.no, options)

    this.options = {
      ...defaultFilterProviderOptions,
      ...options,
      filterTypes: {...defaultFilterProviderOptions.filterTypes, valueless: false, ...options?.filterTypes},
    }

    this.type = FilterProviderType.Select
    this.filterValues = filterValues.map(fv => ({...fv, ariaLabel: `${fv.displayName}, ${this.displayName}`}))
  }

  getSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    config: FilterConfig,
    caretIndex?: number | null,
  ) {
    if (!this.shouldGetSuggestions(filterBlock)) return null

    const lastValue = getLastFilterBlockValue(filterBlock, caretIndex)
    const suggestions: ARIAFilterSuggestion[] = []

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

  validateFilterBlockValues(
    filterQuery: FilterQuery,
    block: FilterBlock,
    values: IndexedBlockValueItem[],
  ): IndexedBlockValueItem[] {
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
