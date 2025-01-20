import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FetchDataEvent,
  FilterItem,
  type FilterProvider,
  type Icon,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch, score} from 'fzy.js'

import {FILTER_PRIORITY_DISPLAY_THRESHOLD} from '../constants/search-filters'
import {AsyncFilterProvider} from './async-filter-provider'

const LABEL_SUGGESTION_ENDPOINT = '/filter-suggestions/labels'

export class LabelFilterProvider extends AsyncFilterProvider implements FilterProvider {
  type = 'filter' as const
  icon: Icon
  singularItemName: string
  name: string
  priority: number
  value: string

  constructor(
    queryBuilder: QueryBuilderElement,
    {
      name,
      value,
      icon,
      priority,
    }: {
      name: string
      value: string
      icon: Icon
      priority: number
    },
    repositoryScope?: string,
  ) {
    super(LABEL_SUGGESTION_ENDPOINT, repositoryScope)

    this.name = name
    this.singularItemName = name
    this.value = value
    this.icon = icon
    this.priority = priority
    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  async handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)!

    if (
      (lastElement.value !== '' || this.priority <= FILTER_PRIORITY_DISPLAY_THRESHOLD) &&
      lastElement?.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement?.value, this.name) || hasMatch(lastElement?.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (lastElement?.type !== this.type || lastElement.filter !== this.value) return

    this.abortPreviousRequests()
    const fetchPromise = this.fetchAndEmitData(event)

    this.dispatchEvent(new FetchDataEvent(fetchPromise))
  }

  async fetchAndEmitData(event: QueryEvent): Promise<void> {
    const response = await this.fetchData(event)
    if (!response || !response.ok) return

    const lastElement = event.parsedQuery.at(-1)!
    const labels = (await response.json()).labels

    for (const label of labels) {
      this.emitSuggestion(label.name, lastElement.value)
    }
  }

  emitSuggestion(name: string, query: string) {
    let priority = 2
    if (query) priority -= score(query, name)
    this.dispatchEvent(
      new FilterItem({
        filter: this.value,
        value: name,
        priority,
      }),
    )
  }
}
