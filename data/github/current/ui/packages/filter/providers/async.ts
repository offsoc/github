import {fuzzyFilter} from '@github-ui/fuzzy-score/fuzzy-filter'

import {Strings} from '../constants/strings'
import {MAXIMUM_SUGGESTIONS_TO_SHOW} from '../context/SuggestionsContext'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  BlockType,
  type FilterBlock,
  type FilterKey,
  INDETERMINANT,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type SuppliedFilterProviderOptions,
  ValidationTypes,
} from '../types'
import {
  getExcludeKeySuggestion,
  getFilterValue,
  getLastFilterBlockValue,
  getNoValueSuggestion,
  getUnescapedFilterValue,
  isEmptyFilterBlockValue,
  isFilterBlock,
  isMutableFilterBlock,
} from '../utils'
import {ValueValidator} from './root'

class ValidationAbortController extends AbortController {
  private rawQuery: string | undefined

  constructor(rawQuery?: string) {
    super()
    this.rawQuery = rawQuery
  }

  abortIfChanged(rawQuery?: string) {
    if (rawQuery === undefined || rawQuery !== this.rawQuery) {
      this.abort()
    }
  }
}

export class AsyncFilterProvider<T> extends ValueValidator<T> {
  suggestionCache: Map<string, T[]>
  validationCache: Map<string, T>

  prefetchedSuggestions: Map<string, ARIAFilterSuggestion>
  completeResultSetQueries: Set<string>
  providerContext?: URLSearchParams
  suggestionEndpoint: string
  validationEndpoint: string
  abortSuggestionsController: AbortController
  abortValidationController: ValidationAbortController
  valueValidator?: (value: string, data: T[] | null) => Partial<IndexedBlockValueItem> | false | null | undefined

  constructor(filterKey: FilterKey, options?: SuppliedFilterProviderOptions) {
    super(filterKey, options)
    this.suggestionEndpoint = ''
    this.validationEndpoint = ''
    this.suggestionCache = new Map()
    this.completeResultSetQueries = new Set()
    this.validationCache = new Map()
    this.abortSuggestionsController = new AbortController()
    this.abortValidationController = new ValidationAbortController()
    this.prefetchedSuggestions = new Map()
  }

  abortPreviousSuggestionsRequests() {
    // If we had any previous requests that were still pending, terminate them and start a new one
    // This avoids race conditions with results coming back out of order
    this.abortSuggestionsController.abort()
    this.abortSuggestionsController = new AbortController()
  }

  abortPreviousValidationRequests(filterQuery?: FilterQuery) {
    // If we had any previous requests that were still pending, terminate them and start a new one
    // This avoids race conditions with results coming back out of order
    this.abortValidationController.abortIfChanged(filterQuery?.raw)
    this.abortValidationController = new ValidationAbortController(filterQuery?.raw)
  }

  getFilterValue(filterBlock: AnyBlock | MutableFilterBlock, filterValue?: string): string {
    if (filterValue) return filterValue

    return (
      getFilterValue(
        isMutableFilterBlock(filterBlock) ? getFilterValue(filterBlock.value?.values.at(-1)?.value) : filterBlock.raw,
      ) ?? ''
    )
  }

  getMetaSuggestions(value: string): ARIAFilterSuggestion[] {
    // value is used by inheriting classes to determine if they should return meta suggestions
    if (!value) return []
    return []
  }

  async processSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    processSuggestion: (item: T, query: string, filterQuery: FilterQuery) => ARIAFilterSuggestion,
    caretIndex?: number | null,
  ) {
    if (!this.shouldGetSuggestions(filterBlock)) return null

    const lastValue = getLastFilterBlockValue(filterBlock, caretIndex)
    this.abortPreviousSuggestionsRequests()
    const instanceAbortController = this.abortSuggestionsController
    const items = (await this.fetchSuggestions(lastValue, filterBlock, filterQuery.contextURLParams)) ?? []
    const filterProviderKey = (filterBlock as FilterBlock).provider.key
    const suggestions: ARIAFilterSuggestion[] = []

    const noValueSuggestion = getNoValueSuggestion(this.displayName, this.icon)
    const excludeKeySuggestion = getExcludeKeySuggestion(filterProviderKey)

    if (
      isEmptyFilterBlockValue(filterBlock) &&
      this.options.filterTypes.valueless &&
      !filterBlock.raw.startsWith('-')
    ) {
      suggestions.push(noValueSuggestion)
    }

    if (
      this.options.filterTypes.exclusive &&
      lastValue === '' &&
      isFilterBlock(filterBlock) &&
      filterBlock.raw !== `-${filterProviderKey}:`
    ) {
      suggestions.unshift(excludeKeySuggestion)
    }

    const processedSuggestions = [
      ...suggestions,
      ...[...items].map(item => processSuggestion(item, lastValue, filterQuery)),
    ]

    for (const suggestion of processedSuggestions) {
      if ([noValueSuggestion, excludeKeySuggestion].includes(suggestion)) continue
      this.prefetchedSuggestions.set(suggestion.value as string, suggestion)
    }

    if (instanceAbortController.signal.aborted) {
      return null
    }

    return processedSuggestions
  }

  async validateFilterBlockValues(
    filterQuery: FilterQuery,
    block: FilterBlock,
    values: IndexedBlockValueItem[],
  ): Promise<IndexedBlockValueItem[]> {
    const valuesIndex: Record<number, IndexedBlockValueItem> = {}
    const validations = values.map(async (v, i) => {
      const extractedValue = getUnescapedFilterValue(v.value)
      // If there is a previous index of the value, we consider any subsequent indexes invalid as duplicates
      const prevIndex = values.findIndex(vi => getUnescapedFilterValue(vi.value) === extractedValue)
      if (!extractedValue || (prevIndex < i && prevIndex >= 0)) {
        valuesIndex[i] = {
          ...v,
          valid: false,
          validations: [{type: ValidationTypes.EmptyValue, message: Strings.filterValueEmpty(this.key)}],
        }
        return
      }

      const prefetchedValue = this.prefetchedSuggestions.get(extractedValue)
      const metaSuggestion = this.getMetaSuggestions(extractedValue)?.[0]
      if (prefetchedValue) {
        valuesIndex[i] = {...v, ...prefetchedValue, valid: true, value: v.value}
        return
      } else if (metaSuggestion?.value === extractedValue) {
        valuesIndex[i] = {...v, ...metaSuggestion, valid: true, value: v.value}
        return
      } else if (filterQuery.activeBlockId !== block.id) {
        // Call fetch suggestions to get the value's data, if it exists
        const queryValue = this.getFilterValue(
          {
            id: 1,
            type: BlockType.Filter,
            raw: `${this.key}:`,
            value: {
              raw: extractedValue,
              values: [{value: extractedValue}],
            },
          },
          extractedValue,
        )
        const data = await this.validateFilterValue(queryValue, filterQuery.contextURLParams, filterQuery)
        // Check for abort errors
        if (data instanceof Error) {
          if (data.message === 'Aborted') {
            valuesIndex[i] = {...v, valid: undefined, value: v.value}
          } else {
            valuesIndex[i] = {...v, valid: false}
          }
        } else {
          const validatedData = this.validateValue?.(filterQuery, v, data)
          if (validatedData) {
            if (validatedData.value === INDETERMINANT) {
              // If a validation can't be determined due to lack of context, we don't want to mark it as invalid.
              // Ex: Querying for assignees when no repo or org is specified
              valuesIndex[i] = {...v, valid: true, value: v.value}
            } else {
              // We explicitly set the value to the extracted value here because the value returned from the server may be different
              valuesIndex[i] = {...v, valid: true, ...validatedData, value: v.value}
            }
          } else {
            valuesIndex[i] = {
              ...v,
              valid: false,
              validations: [
                {type: ValidationTypes.InvalidValue, message: Strings.filterInvalidValue(this.key, extractedValue)},
              ],
            }
          }
          return v
        }
      }
      valuesIndex[i] = {...v, valid: undefined}
    })
    await Promise.all(validations)
    return Object.values(valuesIndex)
  }

  async fetchSuggestions(
    value: string,
    block: AnyBlock | MutableFilterBlock,
    fetchParams?: URLSearchParams,
  ): Promise<T[] | null> {
    try {
      if (this.suggestionCache.has(value)) {
        return this.suggestionCache.get(value) ?? []
      }
      if (!this.suggestionEndpoint || this.suggestionEndpoint === '') throw new Error('No suggestion endpoint provided')

      const endpoint = new URL(this.suggestionEndpoint, window.location.origin)

      const params = new URLSearchParams([fetchParams?.toString(), this.providerContext?.toString()].join('&'))
      params.set('q', value)
      params.set('filter_value', value)
      endpoint.search = params.toString()

      const response = await this.fetchData(endpoint.toString())
      if (!response || !response.ok) {
        return null
      }
      const json = await response.json()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const dataKey = Object.keys(json)[0]
      const suggestions = (dataKey ? json[dataKey] : null) as T[] | null

      if (Array.isArray(suggestions) && suggestions.length < MAXIMUM_SUGGESTIONS_TO_SHOW) {
        this.completeResultSetQueries.add(value)
      }

      if (!suggestions) return null
      this.suggestionCache.set(value, suggestions)
      return suggestions
    } catch {
      return null
    }
  }

  isCompleteResultSetQuery(value: string | null): boolean {
    if (!value) return false

    return (
      Array.from(this.completeResultSetQueries).findIndex(completedQuery => value.startsWith(completedQuery)) !== -1
    )
  }

  findPrefetchedSuggestions(value: string | null): ARIAFilterSuggestion[] {
    if (!value) return []

    const suggestions = fuzzyFilter<ARIAFilterSuggestion>({
      items: [...this.prefetchedSuggestions.values()],
      filter: value,
      key: suggestion => getFilterValue(suggestion.value) ?? '',
      secondaryKey: suggestion => suggestion.displayName ?? '',
    }).slice(0, MAXIMUM_SUGGESTIONS_TO_SHOW)

    suggestions.push(...this.getMetaSuggestions(value))

    return suggestions
  }

  async validateFilterValue(
    value: string,
    fetchParams?: URLSearchParams,
    filterQuery?: FilterQuery,
  ): Promise<T | Error | null> {
    try {
      if (this.validationCache.has(value)) {
        return this.validationCache.get(value) ?? null
      }

      if (!this.validationEndpoint || this.validationEndpoint === '') throw new Error('No validation endpoint provided')

      const endpoint = new URL(this.validationEndpoint, window.location.origin)

      const params = new URLSearchParams([fetchParams?.toString(), this.providerContext?.toString()].join('&'))
      params.set('q', value)
      params.set('filter_value', value)
      endpoint.search = params.toString()

      this.abortPreviousValidationRequests(filterQuery)
      const response = await this.fetchData(endpoint.toString(), this.abortValidationController)
      if (!response) return new Error('Aborted')
      if (!response.ok) return null
      const json = await response.json()

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const keys = Object.keys(json)
      let validationData: T
      if (keys.length === 1 && keys[0] && Array.isArray(json[keys[0]])) {
        validationData = Array.isArray(json[keys[0]]) ? json[keys[0]][0] : json[keys[0]]
      } else {
        validationData = json
      }

      this.validationCache.set(value, validationData)
      return validationData
    } catch {
      return null
    }
  }

  async fetchData(apiURL: string, abortController?: AbortController): Promise<Response | undefined> {
    let response
    try {
      response = await fetch(apiURL, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: abortController?.signal,
      })
    } catch (error) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (error.name !== 'AbortError') {
        throw error
      }
    }

    return response
  }
}
