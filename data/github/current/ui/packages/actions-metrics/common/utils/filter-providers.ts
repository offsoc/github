import {FilterProviderType, FilterValueType} from '@github-ui/filter'
import type {
  FilterQuery,
  FilterKey,
  FilterSuggestion,
  SuppliedFilterProviderOptions,
  MutableFilterBlock,
  AnyBlock,
  FilterProvider,
  ARIAFilterSuggestion,
  FilterValueData,
  ValueRowProps,
  FilterConfig,
  IndexedBlockValueItem,
  FilterBlock,
} from '@github-ui/filter'
import {AsyncFilterProvider, StaticFilterProvider} from '@github-ui/filter/providers'
import {getFilterValue, getUnescapedFilterValue} from '@github-ui/filter/utils'
import {Services} from '../services/services'
import type {IFilterService} from '../services/filter-service'

export class NumberFilterProvider extends StaticFilterProvider {
  constructor(filter: FilterKey, values: FilterSuggestion[], options?: SuppliedFilterProviderOptions) {
    super(filter, values, {...options, filterTypes: {multiKey: false, valueless: false}})
    this.type = FilterProviderType.Number
  }
}
export class ValuesFilterProvider extends StaticFilterProvider {
  constructor(filter: FilterKey, values: FilterSuggestion[], options?: SuppliedFilterProviderOptions) {
    super(filter, values, {...options, filterTypes: {multiKey: false, valueless: false}})
    this.type = values.length === 0 ? FilterProviderType.RawText : FilterProviderType.Select
  }
}

export class AsyncSuggestionsFilterProvider<T> extends AsyncFilterProvider<T> implements FilterProvider {
  public transform: (suggestion: T) => string
  private readonly filterService = Services.get<IFilterService>('IFilterService')

  constructor(
    filter: FilterKey,
    endpoint: string,
    transform: (suggestion: T) => string,
    options?: SuppliedFilterProviderOptions,
  ) {
    super(filter, {
      ...options,
      filterTypes: {multiKey: false, valueless: false},
    })
    this.type = FilterProviderType.Select
    this.suggestionEndpoint = endpoint
    this.validationEndpoint = endpoint
    this.transform = transform
  }

  async getSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    config: FilterConfig,
    caretIndex?: number | null,
  ) {
    return this.processSuggestions(filterQuery, filterBlock, this.processSuggestion.bind(this), caretIndex)
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
    }
  }

  override async fetchSuggestions(value: string): Promise<T[] | null> {
    try {
      const fetchResults = await this.filterService.getAsyncFilterSuggestions(
        this as unknown as AsyncSuggestionsFilterProvider<unknown>,
        value,
        this.abortSuggestionsController.signal,
      )

      // make sure whatever was typed is always selectable and the first result
      const results: string[] = []
      if (value) {
        results.push(value)
      }

      // make sure we don't have duplicate for what was typed
      if (fetchResults) {
        results.push(...fetchResults.filter(v => v !== value))
      }

      const typedResults = results as unknown as T[]

      if (!typedResults?.length) {
        return null
      }

      return typedResults
    } catch {
      return null
    }
  }

  private processSuggestion(data: T, _value: string): ARIAFilterSuggestion {
    const suggestion = this.transform(data)

    return {
      type: FilterValueType.Value,
      value: suggestion,
      ariaLabel: suggestion,
      priority: 0,
    }
  }

  override async validateFilterBlockValues(
    filterQuery: FilterQuery,
    block: FilterBlock,
    values: IndexedBlockValueItem[],
  ): Promise<IndexedBlockValueItem[]> {
    const valuesIndex: Record<number, IndexedBlockValueItem> = {}
    const validations = values.map(async (v, i) => {
      const extractedValue = getUnescapedFilterValue(v.value) ?? ''
      valuesIndex[i] = {
        ...v,
        valid: this.filterService.isFilterValueValid(extractedValue, this),
      }
      return
    })

    await Promise.all(validations)

    return Object.values(valuesIndex)
  }
}

export class AsyncStringSuggestionsFilterProvider extends AsyncSuggestionsFilterProvider<string> {
  constructor(filter: FilterKey, endpoint: string, options?: SuppliedFilterProviderOptions) {
    super(filter, endpoint, str => str, options)
  }
}
