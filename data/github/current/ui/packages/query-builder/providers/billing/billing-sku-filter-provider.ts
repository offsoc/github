import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FetchDataEvent,
  FilterItem,
  type FilterProvider,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch} from 'fzy.js'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

type SKUData = {
  name: string
}

export class BillingSKUFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  slug: string
  priority: number
  singularItemName: string
  value: string

  skuCache: SKUData[] | undefined = undefined

  constructor(
    queryBuilder: QueryBuilderElement,
    {
      name,
      slug,
      value,
      priority,
    }: {
      name: string
      slug: string
      value: string
      priority: number
    },
  ) {
    super()

    this.name = name
    this.slug = slug
    this.singularItemName = name
    this.value = value
    this.priority = priority
    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  async handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)!

    if (
      (lastElement.value !== '' || this.priority <= 5) &&
      lastElement?.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement?.value, this.name) || hasMatch(lastElement?.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (lastElement?.type !== this.type || lastElement.filter !== this.value) return

    if (!this.skuCache) {
      // Immediately set this to avoid multiple requests
      this.skuCache = []
      const fetchPromise = this.fetchTopSKUs(event)
      this.dispatchEvent(new FetchDataEvent(fetchPromise))
    } else {
      for (const sku of this.skuCache) {
        this.emitSuggestion(sku.name, sku.name, lastElement.value)
      }
    }
  }

  async fetchTopSKUs(event: QueryEvent) {
    let skuData = []
    try {
      const url = `/enterprises/${this.slug}/billing/skus`
      const response = await verifiedFetchJSON(url, {method: 'GET'})
      if (response.status !== 200) {
        // If we have an error, we don't want to cache the results, such that we can retry later.
        this.skuCache = undefined
        return
      }

      skuData = await response.json()
    } catch (_) {
      // If we have an error, we don't want to cache the results, such that we can retry later.
      this.skuCache = undefined
      return
    }

    const query = event.parsedQuery.at(-1)!.value
    skuData['skus']?.map((skuResult: {sku: string}) => {
      this.skuCache!.push({name: skuResult.sku})
      this.emitSuggestion(skuResult.sku, skuResult.sku, query)
    })
  }

  emitSuggestion(name: string, value: string, query: string) {
    if (query && !hasMatch(query, value)) return

    this.dispatchEvent(
      new FilterItem({
        filter: this.value,
        value,
        name,
      }),
    )
  }
}
