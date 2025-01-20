import {FilterProviderType, type FilterProvider} from '@github-ui/filter'
import {Utils} from '../utils/utils'
import type {IDataService} from './data-service'
import type {IService} from './services'
import {ServiceBase, Services} from './services'
import type {AsyncSuggestionsFilterProvider} from '../utils/filter-providers'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {FilterUtils} from '../utils/filter-utils'

export interface IFilterService extends IService {
  isFilterValueValid: (filterValue: string, provider: FilterProvider) => boolean
  getAsyncFilterSuggestions: (
    provider: AsyncSuggestionsFilterProvider<unknown>,
    filterValue?: string,
    abortSignal?: AbortSignal,
  ) => Promise<string[] | undefined>
}

export class FilterService extends ServiceBase implements IFilterService {
  public static override readonly serviceId = 'IFilterService'
  private readonly dataService = Services.get<IDataService>('IDataService')
  private readonly validValuesSetMap = new Map<string, Set<string>>()

  public isFilterValueValid(filterValue: string, provider: FilterProvider): boolean {
    if (provider.type !== FilterProviderType.Number) {
      if (!FilterUtils.isAsync(provider)) {
        return this.processProvider(provider).has(filterValue)
      }
    }

    // always return true to allow user typed values
    return !!filterValue
  }

  public async getAsyncFilterSuggestions(
    provider: AsyncSuggestionsFilterProvider<unknown>,
    filterValue?: string,
    abortSignal?: AbortSignal,
  ): Promise<string[] | undefined> {
    return this.debounceGetAsyncFilterSuggestions(provider, filterValue, abortSignal) as never
  }

  private debounceGetAsyncFilterSuggestions = Utils.debounce(
    (provider: AsyncSuggestionsFilterProvider<unknown>, filterValue?: string, abortSignal?: AbortSignal) => {
      return this.getAsyncFilterSuggestionsInternal(provider, filterValue, abortSignal)
    },
  )

  private async getAsyncFilterSuggestionsInternal(
    provider: AsyncSuggestionsFilterProvider<unknown>,
    filterValue?: string,
    abortSignal?: AbortSignal,
  ): Promise<string[] | undefined> {
    const params = new URLSearchParams()
    params.set('q', filterValue ?? '')

    const viewParams = new URLSearchParams(ssrSafeLocation.search)
    if (viewParams.has('version')) {
      const version = viewParams.get('version')
      version && params.set('version', version)
    }

    // this will not return Response, but force cast it here and fix in fetchSuggestions
    const unknownItems = await this.dataService.get<unknown[]>(`${provider.suggestionEndpoint}?${params.toString()}`, {
      requestInit: {signal: abortSignal},
    })
    const items = unknownItems?.map(item => provider.transform(item))

    if (items) {
      if (!this.validValuesSetMap.has(provider.key)) {
        this.validValuesSetMap.set(provider.key, new Set<string>())
      }

      const set = this.validValuesSetMap.get(provider.key)!

      for (const item of items) {
        set.add(provider.transform(item))
      }
    }

    return items
  }

  private processProvider(provider: FilterProvider): Set<string> {
    let valuesSet = this.validValuesSetMap.get(provider.key)
    if (!valuesSet) {
      if (provider.type === FilterProviderType.Select && provider.filterValues?.length) {
        // init with provider options because it is not async
        const values = provider.filterValues.map(value => value.value) as string[]
        valuesSet = new Set<string>(values)
      } else {
        valuesSet = new Set<string>()
      }

      this.validValuesSetMap.set(provider.key, valuesSet)
    }
    return valuesSet
  }
}
