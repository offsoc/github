import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'
import {hasMatch} from 'fzy.js'

import {
  FILTER_KEYS,
  FILTER_VALUES,
  type IS_FILTER_PROVIDER_VALUE_KEYS,
  IS_FILTER_PROVIDER_VALUES,
  type LINKED_FILTER_PROVIDER_VALUE_KEYS,
  LINKED_FILTER_PROVIDER_VALUES,
  type SORT_FILTER_PROVIDER_VALUE_KEYS,
  SORT_FILTER_PROVIDER_VALUES,
  SORT_REACTIONS_FILTER_PROVIDER_VALUES,
} from '../constants/filter-constants'
import {Strings} from '../constants/strings'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  type FilterBlock,
  type FilterConfig,
  type FilterKey,
  FilterOperator,
  type FilterProvider,
  FilterProviderType,
  type FilterSuggestion,
  type FilterValueData,
  FilterValueType,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type SuppliedFilterProviderOptions,
  ValidationTypes,
  type ValueRowProps,
} from '../types'
import {
  caseInsensitiveStringCompare,
  getExcludeKeySuggestion,
  getFilterValue,
  getFilterValuesByStateType,
  getLastFilterBlockValue,
  getNoValueSuggestion,
  getUnescapedFilterValue,
  isEmptyFilterBlockValue,
  isFilterBlock,
} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {RootFilterProvider} from './root'

const NUMBER_RANGE_REGEX = /(?:>|<|>=|<=)?(\d+)/g
const DATE_REGEX = /^(?:>|<|>=|<=)?(\d{4}-\d{1,2}-\d{1,2})?$/
const DATE_TIME_REGEX = /^(?:>|<|>=|<=)?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?)$/
const DATE_TIME_TZ_REGEX = /^(?:>|<|>=|<=)?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2})$/
const DYNAMIC_DATE_REGEX = /^(?:>|<|>=|<=)?(@[A-Za-z]+)([+-]\d+[mdwqy])?$/
const operators = ['>=', '<=', '>', '<']

export class StaticFilterProvider extends RootFilterProvider implements FilterProvider {
  filterValues: ARIAFilterSuggestion[]

  constructor(filterKey: FilterKey, filterValues: FilterSuggestion[], options?: SuppliedFilterProviderOptions) {
    super(filterKey, options)
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
    const filterProviderKey = (filterBlock as FilterBlock).provider.key
    const suggestions: ARIAFilterSuggestion[] = []

    if (isEmptyFilterBlockValue(filterBlock) && this.options.filterTypes.valueless) {
      suggestions.push(getNoValueSuggestion(this.displayName, this.icon))
    }

    if (
      this.options.filterTypes.exclusive &&
      lastValue === '' &&
      isFilterBlock(filterBlock) &&
      filterBlock.raw !== `-${filterProviderKey}:`
    ) {
      const excludeKeySuggestion = getExcludeKeySuggestion(filterProviderKey)
      suggestions.unshift(excludeKeySuggestion)
    }

    const inputOperator = operators.find(operator => lastValue === operator || lastValue === `${operator}@`)

    if (!lastValue && !inputOperator) return this.filterValues

    for (const filterValue of this.filterValues) {
      const {value: fValue, displayName} = filterValue
      const value = getFilterValue(fValue)

      const suggestion = {...filterValue, type: FilterValueType.Value}
      const hasOperator = value && !operators.find(operator => value.startsWith(operator))

      // If the filter is a date filter and the input has a operator,
      // we want to include the modifier in the suggestion
      if (this.type === FilterProviderType.Date && hasOperator) {
        suggestion.value = `${inputOperator ?? ''}${value}`
      } else {
        const matchesValue = !!value && hasMatch(lastValue, value)
        const matchesAlias =
          !!config.aliasMatching && filterValue.aliases && filterValue.aliases.some(alias => hasMatch(lastValue, alias))
        const matchesDisplayName = !!displayName && hasMatch(lastValue, displayName)

        if (!value || (!matchesValue && !matchesDisplayName && !matchesAlias)) continue
      }

      filterValue.priority -= fuzzyScore(lastValue, value)

      suggestions.push(suggestion)
    }

    return suggestions
  }

  async validateFilterBlockValues(
    filterQuery: FilterQuery,
    block: FilterBlock,
    values: IndexedBlockValueItem[],
    config: FilterConfig,
  ): Promise<IndexedBlockValueItem[]> {
    const valuesIndex: Record<number, IndexedBlockValueItem> = []
    const validations = values.map((v, i) => {
      if (
        !this.options.filterTypes.multiValue &&
        ((block.operator === FilterOperator.Between && i > 1) || (block.operator !== FilterOperator.Between && i > 0))
      ) {
        valuesIndex[i] = {
          ...v,
          valid: false,
          validations: [
            {type: ValidationTypes.MultiValueUnsupported, message: Strings.filterMultiValueFalse(this.key)},
          ],
        }
        return
      }

      const extractedValue = getUnescapedFilterValue(v.value)

      if (!extractedValue) {
        valuesIndex[i] = {
          ...v,
          valid: false,
          validations: [{type: ValidationTypes.EmptyValue, message: Strings.filterValueEmpty(this.key)}],
        }
        return
      }

      if (block.operator === FilterOperator.Between && operators.some(op => extractedValue.startsWith(op))) {
        valuesIndex[i] = {
          ...v,
          valid: false,
          validations: [
            {
              type: ValidationTypes.InvalidValue,
              message: Strings.filterInvalidValue(this.key, extractedValue),
            },
          ],
        }
        return
      }

      let typeValidity = true
      switch (this.type) {
        case FilterProviderType.Boolean:
        case FilterProviderType.Select:
          typeValidity =
            this.filterValues.find(fv => {
              return (
                getFilterValue(fv.value) === extractedValue ||
                (config?.aliasMatching && fv.aliases?.includes(extractedValue))
              )
            }) !== undefined
          break
        case FilterProviderType.Text:
          typeValidity = true
          break
        case FilterProviderType.Number: {
          const numbers = extractedValue.match(NUMBER_RANGE_REGEX)
          typeValidity = (numbers?.length ?? 0) > 0 && numbers?.[0] === extractedValue
          break
        }
        case FilterProviderType.Date:
          if (extractedValue) {
            if (DYNAMIC_DATE_REGEX.test(extractedValue)) {
              const [, date] = DYNAMIC_DATE_REGEX.exec(extractedValue) ?? []
              typeValidity = this.filterValues.find(fv => getFilterValue(fv.value) === date) !== undefined
            } else {
              let date = null
              if (DATE_TIME_TZ_REGEX.test(extractedValue)) {
                date = DATE_TIME_TZ_REGEX.exec(extractedValue)?.[1] ?? null
              } else if (DATE_TIME_REGEX.test(extractedValue)) {
                date = DATE_TIME_REGEX.exec(extractedValue)?.[1] ?? null
              } else if (DATE_REGEX.test(extractedValue)) {
                date = DATE_REGEX.exec(extractedValue)?.[1] ?? null
              }
              typeValidity = date ? !isNaN(Date.parse(date)) : false
            }
          }
          break
        default:
          typeValidity = true
          break
      }
      const suggestion = this.filterValues.find(fv =>
        caseInsensitiveStringCompare(getFilterValue(fv.value) ?? '', extractedValue),
      )
      if (suggestion) {
        // We explicitly set the value to the extracted value here because the suggestion value may be different
        valuesIndex[i] = {...v, ...suggestion, valid: true, value: v.value}
      } else {
        valuesIndex[i] = {...v, valid: typeValidity}
      }
    })

    await Promise.all(validations)

    return Object.values(valuesIndex)
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
      description: value.description,
      leadingVisual: ValueIcon({value}),
    }
  }
}

export class ArchivedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const opts = {
      ...options,
      filterTypes: {...options?.filterTypes, multiValue: false, valueless: false},
    }
    super(FILTER_KEYS.archived, FILTER_VALUES.archived, opts)
    this.type = FilterProviderType.Boolean
  }
}

export class ClosedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.closed, FILTER_VALUES.closed, options)
    this.type = FilterProviderType.Date
  }
}

export class CommentsFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const defaultOptions: SuppliedFilterProviderOptions = {filterTypes: {multiValue: false, valueless: false}}
    super(FILTER_KEYS.comments, FILTER_VALUES.comments, {
      ...defaultOptions,
      ...options,
      filterTypes: {...defaultOptions.filterTypes, ...options?.filterTypes},
    })
    this.type = FilterProviderType.Number
  }
}

export class CreatedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const defaultOptions: SuppliedFilterProviderOptions = {filterTypes: {valueless: false}}
    super(FILTER_KEYS.created, FILTER_VALUES.created, {
      ...defaultOptions,
      ...options,
      filterTypes: {...defaultOptions.filterTypes, ...options?.filterTypes},
    })
    this.type = FilterProviderType.Date
  }
}

export class DraftFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const defaultOptions: SuppliedFilterProviderOptions = {filterTypes: {multiValue: false, valueless: false}}
    super(FILTER_KEYS.draft, FILTER_VALUES.draft, {
      ...defaultOptions,
      ...options,
      filterTypes: {...defaultOptions.filterTypes, ...options?.filterTypes},
    })
    this.type = FilterProviderType.Boolean
  }
}

export class InteractionsFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const defaultOptions: SuppliedFilterProviderOptions = {filterTypes: {multiValue: false, valueless: false}}
    super(FILTER_KEYS.interactions, FILTER_VALUES.interactions, {
      ...defaultOptions,
      ...options,
      filterTypes: {...defaultOptions.filterTypes, ...options?.filterTypes},
    })
    this.type = FilterProviderType.Number
  }
}

export class IsFilterProvider extends StaticFilterProvider {
  constructor(valueIds?: IS_FILTER_PROVIDER_VALUE_KEYS[], options?: SuppliedFilterProviderOptions) {
    const values = valueIds?.map(id => IS_FILTER_PROVIDER_VALUES[id]).filter(Boolean) ?? []
    const defaultOptions: SuppliedFilterProviderOptions = {filterTypes: {valueless: false}}
    super(FILTER_KEYS.is, values?.length > 0 ? values : FILTER_VALUES.is, {
      ...defaultOptions,
      ...options,
      filterTypes: {...defaultOptions.filterTypes, ...options?.filterTypes},
    })
    this.type = FilterProviderType.Select
  }
}

export class LinkedFilterProvider extends StaticFilterProvider {
  constructor(valueIds?: LINKED_FILTER_PROVIDER_VALUE_KEYS[], options?: SuppliedFilterProviderOptions) {
    const opts = {
      ...options,
      filterTypes: {...options?.filterTypes, multiValue: false, valueless: false},
    }
    const values = valueIds?.map(id => LINKED_FILTER_PROVIDER_VALUES[id]).filter(Boolean) ?? []
    super(FILTER_KEYS.linked, values?.length > 0 ? values : FILTER_VALUES.linked, opts)
    this.type = FilterProviderType.Select
  }
}

export class MergedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const opts = {
      ...options,
      filterTypes: {...options?.filterTypes, multiValue: false},
    }
    super(FILTER_KEYS.merged, FILTER_VALUES.merged, opts)
    this.type = FilterProviderType.Date
  }
}

export class ReactionsFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.reactions, FILTER_VALUES.reactions, {
      ...options,
      filterTypes: {multiValue: false, valueless: false, ...options?.filterTypes},
    })
    this.type = FilterProviderType.Number
  }
}

export class ReasonFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.reason, FILTER_VALUES.reason, options)
    this.type = FilterProviderType.Select
  }
}

export class ReviewFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.review, FILTER_VALUES.review, options)
    this.type = FilterProviderType.Select
  }
}

export class SortFilterProvider extends StaticFilterProvider {
  constructor(valueIds: SORT_FILTER_PROVIDER_VALUE_KEYS[], options?: SuppliedFilterProviderOptions) {
    const descValues = valueIds?.map(id => SORT_FILTER_PROVIDER_VALUES[`${id}-desc`]).filter(Boolean) ?? []
    const ascValues = valueIds?.map(id => SORT_FILTER_PROVIDER_VALUES[`${id}-asc`]).filter(Boolean) ?? []
    const reactionValues = valueIds?.includes('reactions') ? SORT_REACTIONS_FILTER_PROVIDER_VALUES : []

    const values = [...descValues, ...ascValues, ...reactionValues]
    super(FILTER_KEYS.sort, values?.length > 0 ? values : FILTER_VALUES.sort, options)
    this.type = FilterProviderType.Select
  }
}

// TODO: Would it make sense to move this to types.ts?
export type StateFilterProviderType = 'mixed' | 'memex' | 'issues' | 'pr'
export class StateFilterProvider extends StaticFilterProvider {
  stateContext: StateFilterProviderType

  constructor(type: StateFilterProviderType = 'mixed', options?: SuppliedFilterProviderOptions) {
    const values = getFilterValuesByStateType(type)
    const defaultOptions: SuppliedFilterProviderOptions = {filterTypes: {valueless: false}}
    super(FILTER_KEYS.state, values, {
      ...defaultOptions,
      ...options,
      filterTypes: {...defaultOptions.filterTypes, ...options?.filterTypes},
    })
    this.stateContext = type
    this.type = FilterProviderType.Select
  }
}

export class StatusFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.status, FILTER_VALUES.status, options)
    this.type = FilterProviderType.Select
  }
}

export class UpdatedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.updated, FILTER_VALUES.updated, options)
    this.type = FilterProviderType.Date
  }
}
