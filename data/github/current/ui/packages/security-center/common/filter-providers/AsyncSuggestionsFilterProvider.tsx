import type {
  AnyBlock,
  ARIAFilterSuggestion,
  FilterConfig,
  FilterKey,
  FilterProvider,
  FilterQuery,
  FilterValueData,
  IndexedBlockValueItem,
  MutableFilterBlock,
  ValueRowProps,
} from '@github-ui/filter'
import {FilterProviderType, FilterValueType} from '@github-ui/filter'
import {AsyncFilterProvider} from '@github-ui/filter/providers'
import {getFilterValue, isMutableFilterBlock} from '@github-ui/filter/utils'
import {score} from 'fzy.js'

import debounce from '../../overview-dashboard/utils/debounce'
import {DEFAULT_FILTER_TYPE_OPTIONS} from './types'

const SUGGESTION_LIMIT = 8

type Suggestion = {
  value: string
  displayName?: string
  description?: string
}

export default class AsyncSuggestionsFilterProvider extends AsyncFilterProvider<Suggestion> implements FilterProvider {
  constructor(filterKey: FilterKey, endpoint: string) {
    super(filterKey, {filterTypes: DEFAULT_FILTER_TYPE_OPTIONS})
    this.suggestionEndpoint = endpoint
    this.validationEndpoint = endpoint
    this.type = FilterProviderType.Select

    // The base implementation does not debounce requests. Because our filter suggestions are based
    // on "what you can see", we must debounce requests to save on server request resources.
    //
    // Nested promises are flattened in javascript, so Promise<Promise<T>> == Promise<T>
    // Typescript doesn't know this, so casting through unknown first
    // https://github.com/microsoft/TypeScript/issues/27711
    this.fetchData = debounce(this.fetchData.bind(this), 500) as unknown as (
      apiURL: string,
      abortController?: AbortController,
    ) => Promise<Response | undefined>
  }

  async getSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    _config: FilterConfig,
    caretIndex?: number | null,
  ): Promise<ARIAFilterSuggestion[] | null> {
    return this.processSuggestions(filterQuery, filterBlock, this.processSuggestion.bind(this), caretIndex)
  }

  protected processSuggestion(item: Suggestion, query: string, _filterQuery: FilterQuery): ARIAFilterSuggestion {
    let priority = 3

    if (query) {
      if (item.value) priority -= score(query, item.value)
      if (item.displayName) priority -= score(query, item.displayName)
    }

    return {
      type: FilterValueType.Value,
      displayName: item.displayName ?? item.value,
      ariaLabel: `${item.displayName || item.value}, ${this.displayName}`,
      value: item.value ?? '',
      priority,
      description: item.description,
      inlineDescription: false,
    }
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
      description: value.description,
      descriptionVariant: 'block',
    }
  }

  getSelectedValues(filterBlock: AnyBlock | MutableFilterBlock): string[] {
    if (isMutableFilterBlock(filterBlock)) {
      const blockValues = filterBlock.value?.values as IndexedBlockValueItem[]
      const values = blockValues.reduce<string[]>((acc, v) => {
        if (v.value === '') return acc
        if (v.hasCaret === undefined || v.hasCaret) return acc

        return [...acc, v.value as string]
      }, [])

      return values
    }

    return []
  }

  // The security overview filter suggestions endpoint uses a different request/response structure than the base.
  override async fetchSuggestions(
    value: string,
    block: AnyBlock | MutableFilterBlock,
    fetchParams?: URLSearchParams,
  ): Promise<Suggestion[] | null> {
    try {
      //TODO: Remove once prefetch feature flag is integrated
      if (this.suggestionCache.has(value)) {
        return this.suggestionCache.get(value) ?? []
      }

      if (!this.suggestionEndpoint) throw new Error('No suggestion endpoint provided')

      const endpoint = new URL(this.suggestionEndpoint, window.location.origin)

      const params = new URLSearchParams([fetchParams?.toString(), this.providerContext?.toString()].join('&'))
      params.set('limit', SUGGESTION_LIMIT.toString())
      params.set('selected_values', this.getSelectedValues(block).toString())
      params.set('value', getFilterValue(value) ?? '')
      // endpoint has a `option-type` query param that we do not want to overwrite, so we append
      endpoint.search += `&${params.toString()}`

      const response = await this.fetchData(endpoint.toString(), this.abortSuggestionsController)
      if (!response || !response.ok) {
        return null
      }

      const suggestions = (await response.json()) as Suggestion[]

      if (Array.isArray(suggestions) && suggestions.length < SUGGESTION_LIMIT) {
        this.completeResultSetQueries.add(value)
      }

      this.suggestionCache.set(value, suggestions)
      return suggestions
    } catch {
      return null
    }
  }

  // The security overview filter suggestions endpoint uses a different request/response structure than the base.
  // This method confirms that the single supplied value is a valid filter option.
  override async validateFilterValue(value: string, fetchParams?: URLSearchParams): Promise<Suggestion | Error | null> {
    try {
      if (this.validationCache.has(value)) {
        return this.validationCache.get(value) ?? null
      }

      if (!this.validationEndpoint) throw new Error('No validation endpoint provided')

      const endpoint = new URL(this.validationEndpoint, window.location.origin)

      const params = new URLSearchParams([fetchParams?.toString(), this.providerContext?.toString()].join('&'))
      params.set('limit', '1')
      params.set('value', getFilterValue(value) ?? '')
      params.set('_validate', '1') // for telemetry
      // endpoint has a `option-type` query param that we do not want to overwrite, so we append
      endpoint.search += `&${params.toString()}`

      this.abortPreviousValidationRequests()
      const response = await this.fetchData(endpoint.toString(), this.abortValidationController)
      if (!response) return new Error('Aborted')
      if (!response.ok) return null

      const suggestions = (await response.json()) as Suggestion[]
      const validationData = suggestions.find(x => x.value === value)
      if (!validationData) return null

      this.validationCache.set(value, validationData)
      return validationData
    } catch {
      return null
    }
  }
}
