import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FetchDataEvent,
  FilterItem,
  type FilterProvider,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch} from 'fzy.js'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

type CostCenterResponse = {
  name: string
  costCenterKey: {uuid: string}
}

type CostCenterData = {
  name: string
  id: string
}

export class BillingCostCenterFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  slug: string
  priority: number
  singularItemName: string
  value: string

  costCenterCache: CostCenterData[] | undefined = undefined

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

    if (!this.costCenterCache) {
      // Immediately set this to avoid multiple requests
      this.costCenterCache = []
      const fetchPromise = this.fetchCostCenters(event)
      this.dispatchEvent(new FetchDataEvent(fetchPromise))
    } else {
      for (const costCenter of this.costCenterCache) {
        this.emitSuggestion(costCenter.name, costCenter.name, lastElement.value)
      }
    }
  }

  async fetchCostCenters(event: QueryEvent) {
    let costCenterData = []
    try {
      const url = `/enterprises/${this.slug}/billing/cost_centers_list`
      const response = await verifiedFetchJSON(url, {method: 'GET'})
      if (response.status !== 200) {
        // If we have an error, we don't want to cache the results, such that we can retry later.
        this.costCenterCache = undefined
        return
      }

      costCenterData = await response.json()
    } catch (_) {
      // If we have an error, we don't want to cache the results, such that we can retry later.
      this.costCenterCache = undefined
      return
    }

    const query = event.parsedQuery.at(-1)!.value
    costCenterData?.map((costCenter: CostCenterResponse) => {
      const returnedCostCenter: CostCenterData = {
        name: costCenter.name,
        id: costCenter.costCenterKey.uuid,
      }
      this.costCenterCache!.push({...returnedCostCenter})
      this.emitSuggestion(returnedCostCenter.name, returnedCostCenter.name, query)
    })

    // Allow querying usage that is not associated with a cost center
    const noneCostCenter: CostCenterData = {
      name: 'None',
      id: 'None',
    }
    this.costCenterCache!.push({...noneCostCenter})
    this.emitSuggestion(noneCostCenter.name, noneCostCenter.name, query)
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
